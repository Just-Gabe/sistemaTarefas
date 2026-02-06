import React, { useState, useMemo } from 'react';
import {
  IonContent, IonModal, IonButton, IonFab, IonFabButton, IonIcon, IonPage,
  IonHeader, IonToolbar, IonTitle, IonItem, IonLabel, IonInput, IonList,
  IonButtons, IonDatetime, IonAlert, IonFooter, IonReorderGroup, IonReorder, ItemReorderEventDetail
} from '@ionic/react';
import { add, close, saveOutline, trashOutline, createOutline, reorderTwoOutline } from 'ionicons/icons';

interface Tarefa {
  id: number;
  nome: string;
  custo: number;
  dataLimite: string;
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

  const totalCustos = useMemo(() => tarefas.reduce((acc, t) => acc + t.custo, 0), [tarefas]);
  const formatarMoeda = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

  const doReorder = (event: CustomEvent<ItemReorderEventDetail>) => {
    const listaOrdenada = [...tarefas].sort((a, b) => a.ordem - b.ordem);
    const novaLista = event.detail.complete(listaOrdenada);
    
    const listaAtualizada = novaLista.map((tarefa: Tarefa, index: number) => ({
      ...tarefa,
      ordem: index + 1
    }));

    setTarefas(listaAtualizada);
  };

  const handleSave = () => {
    const custoNum = parseFloat(custo);
    const novaOrdem = parseInt(ordemManual);

    if (!nome.trim() || isNaN(custoNum) || isNaN(novaOrdem)) {
      alert("Todos os campos são obrigatórios!");
      return;
    }

    const nomeExiste = tarefas.find(t => t.nome.toLowerCase() === nome.toLowerCase() && t.id !== editId);
    if (nomeExiste) {
      alert("Já existe uma tarefa com este nome");
      return;
    }

    let listaNova = [...tarefas];

    if (editId !== null) {
      listaNova = listaNova.map(t => 
        t.id === editId ? { ...t, nome, custo: custoNum, dataLimite: data, ordem: novaOrdem } : t
      );
    } else {
      const novaTarefa: Tarefa = {
        id: Date.now(),
        nome,
        custo: custoNum,
        dataLimite: data,
        ordem: novaOrdem
      };
      listaNova.push(novaTarefa);
    }

    const listaFinal = listaNova
      .sort((a, b) => {
        if (a.ordem === b.ordem) return a.id === editId ? -1 : 1; 
        return a.ordem - b.ordem;
      })
      .map((t, index) => ({ ...t, ordem: index + 1 }));

    setTarefas(listaFinal);
    fecharModal();
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
    setData(t.dataLimite);
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
            {tarefas.sort((a, b) => a.ordem - b.ordem).map((t) => (
              <IonItem key={t.id} style={{ '--background': t.custo >= 1000 ? '#b0bf28' : 'transparent' }}>
                <IonReorder slot="start">
                   <IonIcon icon={reorderTwoOutline} />
                </IonReorder>

                <IonLabel>
                  <h2 style={{ fontWeight: 'bold' }}>{t.ordem}. {t.nome}</h2>
                  <p style={{color:"white"}}>Custo: {formatarMoeda(t.custo)} | Limite: {formatarData(t.dataLimite)}</p>
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

        {tarefas.length === 0 && <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhuma tarefa encontrada</p>}

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
              <IonInput value={nome} placeholder="Nome único" onIonChange={e => setNome(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Custo (R$)</IonLabel>
              <IonInput type="number" value={custo} placeholder="0.00" onIonChange={e => setCusto(e.detail.value!)} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Data Limite</IonLabel>
              <IonDatetime presentation="date" value={data} onIonChange={e => setData(e.detail.value as string)} />
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
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlertExcluir.show}
          header="Confirmar Exclusão"
          message="Deseja realmente excluir esta tarefa?"
          buttons={[
            { text: 'Não', role: 'cancel' },
            { text: 'Sim', handler: () => setTarefas(tarefas.filter(t => t.id !== showAlertExcluir.id).map((t, idx) => ({...t, ordem: idx + 1}))) }
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
