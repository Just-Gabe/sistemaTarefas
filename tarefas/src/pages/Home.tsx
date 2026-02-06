import React, { useState, useMemo, useEffect } from 'react';
import {
  IonContent, IonModal, IonButton, IonIcon, IonPage,
  IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput, IonList,
  IonButtons, IonDatetime, IonAlert, IonFooter, IonReorderGroup, IonReorder, ItemReorderEventDetail
} from '@ionic/react';
import { add, close, saveOutline, trashOutline, createOutline, reorderTwoOutline } from 'ionicons/icons';
import { supabase } from '../supabase';

interface Tarefa {
  id: number;
  nome: string;
  custo: number;
  data_limite: string; 
  ordem: number;
}

const ListaTarefas: React.FC = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [showAlertExcluir, setShowAlertExcluir] = useState<{ show: boolean; id?: number }>({ show: false });
  const [nome, setNome] = useState('');
  const [custo, setCusto] = useState<string>('');
  const [data, setData] = useState(new Date().toISOString());
  const [ordemManual, setOrdemManual] = useState<string>('');
  const carregarTarefas = async () => {
    const { data: dataBD, error } = await supabase
      .from('Tarefas')
      .select('*')
      .order('ordem', { ascending: true });

    if (error) {
      console.error("Erro ao carregar tarefas:", error.message);
    } else {
      setTarefas(dataBD || []);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, []);

  const totalCustos = useMemo(() => tarefas.reduce((acc, t) => acc + (t.custo || 0), 0), [tarefas]);
  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarDataExibicao = (iso: string) => {
    if (!iso) return '';
    const [year, month, day] = iso.split('-'); 
    return `${day}/${month}/${year}`;
  };

  const handleSave = async () => {
    const custoNum = parseFloat(custo);
    const novaOrdem = parseInt(ordemManual);

    if (!nome.trim() || isNaN(custoNum) || isNaN(novaOrdem)) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    if (custoNum < 0) {
      alert("O custo deve ser maior ou igual a zero.");
      return;
    }

    const dataParaBanco = data.includes('T') ? data.split('T')[0] : data;

    const tarefaObjeto = {
      nome: nome,
      custo: custoNum,
      data_limite: dataParaBanco, 
      ordem: novaOrdem
    };

    if (editId !== null) {
      const { error } = await supabase
        .from('Tarefas')
        .update(tarefaObjeto)
        .eq('id', editId);
      
      if (error) {
        if (error.code === '23505') return alert("Erro: Já existe uma tarefa com este nome ou ordem.");
        return alert("Erro ao editar: " + error.message);
      }
    } else {
      const { error } = await supabase
        .from('Tarefas')
        .insert([tarefaObjeto]);

      if (error) {
        if (error.code === '23505') return alert("Erro: Já existe uma tarefa com este nome ou ordem.");
        return alert("Erro ao salvar: " + error.message);
      }
    }

    fecharModal();
    carregarTarefas(); 
  };

  const excluirTarefaBanco = async (id: number) => {
    const { error } = await supabase
      .from('Tarefas')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Erro ao excluir do banco.");
    } else {
      carregarTarefas();
    }
    setShowAlertExcluir({ show: false });
  };

  const doReorder = async (event: CustomEvent<ItemReorderEventDetail>) => {
    const novaLista = event.detail.complete([...tarefas]);
    
    const listaComNovasOrdens = novaLista.map((t: Tarefa, index: number) => ({
      ...t,
      ordem: index + 1
    }));

    setTarefas(listaComNovasOrdens);

    const updates = listaComNovasOrdens.map((t: Tarefa) => 
      supabase.from('Tarefas').update({ ordem: t.ordem }).eq('id', t.id)
    );

    await Promise.all(updates);
    event.detail.complete();
  };

  const fecharModal = () => {
    setShowModal(false);
    setEditId(null);
    setNome('');
    setCusto('');
    setData(new Date().toISOString());
    setOrdemManual('');
  };

  const abrirEdicao = (t: Tarefa) => {
    setEditId(t.id);
    setNome(t.nome);
    setCusto(t.custo.toString());
    setData(t.data_limite);
    setOrdemManual(t.ordem.toString());
    setShowModal(true);
  };

  const abrirInclusao = () => {
    setEditId(null);
    setOrdemManual((tarefas.length + 1).toString());
    setShowModal(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Sistema de Tarefas</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonReorderGroup disabled={false} onIonItemReorder={doReorder}>
            {tarefas.map((t: Tarefa) => (
              <IonItem 
                key={t.id} 
                style={{ '--background': t.custo >= 1000 ? '#d67104' : 'transparent' }} // coloquei um tom de laranja escuro escolhido no hex color picker, amarelo estava muito forte
              >
                <IonReorder slot="start">
                   <IonIcon icon={reorderTwoOutline} color="medium" />
                </IonReorder>

                <IonLabel>
                  <h2 style={{ fontWeight: 'bold' }}>{t.ordem}. {t.nome}</h2>
                  <p style={{ color: t.custo >= 1000 ? "white" : "inherit" }}>
                    Custo: {formatarMoeda(t.custo)} | Limite: {formatarDataExibicao(t.data_limite)}
                  </p>
                </IonLabel>

                <IonButtons slot="end">
                  <IonButton color="primary" onClick={() => abrirEdicao(t)}>
                    <IonIcon icon={createOutline} />
                  </IonButton>
                  <IonButton color="danger" onClick={() => setShowAlertExcluir({ show: true, id: t.id })}>
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonButtons>
              </IonItem>
            ))}
          </IonReorderGroup>
        </IonList>

        {tarefas.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhuma tarefa encontrada no banco.</p>
        )}

        <IonModal isOpen={showModal} onDidDismiss={fecharModal}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>{editId ? 'Editar Tarefa' : 'Nova Tarefa'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={fecharModal}><IonIcon icon={close} /></IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Nome da Tarefa</IonLabel>
              <IonInput 
                value={nome} 
                placeholder="Ex: Comprar servidor" 
                onIonChange={e => setNome(e.detail.value!)} 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Custo (R$)</IonLabel>
              <IonInput 
                type="number" 
                value={custo} 
                placeholder="0.00" 
                onIonChange={e => setCusto(e.detail.value!)} 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Data Limite</IonLabel>
              <IonDatetime 
                presentation="date" 
                value={data} 
                onIonChange={e => setData(e.detail.value as string)} 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Ordem de Apresentação</IonLabel>
              <IonInput 
                type="number" 
                value={ordemManual} 
                onIonChange={e => setOrdemManual(e.detail.value!)} 
              />
            </IonItem>

            <IonButton expand="block" onClick={handleSave} className="ion-margin-top">
              <IonIcon icon={saveOutline} slot="start" /> Salvar Tarefa
            </IonButton>
            <IonButton expand="block" fill="clear" color="medium" onClick={fecharModal}>
              Cancelar
            </IonButton>
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlertExcluir.show}
          header="Confirmar Exclusão"
          message="Deseja realmente excluir esta tarefa permanentemente?"
          buttons={[
            { text: 'Não', role: 'cancel' },
            { text: 'Sim', handler: () => excluirTarefaBanco(showAlertExcluir.id!) }
          ]}
          onDidDismiss={() => setShowAlertExcluir({ show: false })}
        />

        <div className="ion-padding">
          <IonButton expand="block" onClick={abrirInclusao}>
            <IonIcon icon={add} slot="start" /> Incluir Tarefa
          </IonButton>
        </div>
      </IonContent>

      <IonFooter>
        <IonToolbar color="light">
          <IonTitle size="small">Somatório Total: {formatarMoeda(totalCustos)}</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default ListaTarefas;
