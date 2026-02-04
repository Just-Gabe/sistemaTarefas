import React, { useState } from 'react';
import {
  IonContent,
  IonModal,
  IonButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonTextarea,
  IonButtons
} from '@ionic/react';
import { add, close, saveOutline } from 'ionicons/icons';

interface Item {
  title: string;
  custo: numeric;
}

const Tarefas: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [items, setItems] = useState<Item[]>([]); 
  
  const [newTitle, setNewTitle] = useState('');
  const [newcusto, setNewcusto] = useState('');

  const handleSave = () => {
    if (newTitle.trim() === '') return;

    const newItem: Item = {
      title: newTitle,
      custo: newcusto
    };

    setItems([...items, newItem]); 
    setNewTitle(''); 
    setNewcusto(''); 
    setShowModal(false); 
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Meus Itens</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          {items.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhum item adicionado.</p>
          )}
          {items.map((item, index) => (
            <IonItem key={index}>
              <IonLabel>
                <h2>{item.title}</h2>
                <p>{item.custo}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Novo Item</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Título da tarefa</IonLabel>
              <IonInput 
                value={newTitle} 
                placeholder="Ex: Comprar pão" 
                onIonChange={e => setNewTitle(e.detail.value!)} 
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Custo</IonLabel>
              <IonTextarea 
                value={newcusto} 
                placeholder="Detalhes aqui..." 
                onIonChange={e => setNewcusto(e.detail.value!)} 
              />
            </IonItem>

            <div style={{ marginTop: '20px' }}>
              <IonButton expand="block" onClick={handleSave}>
                <IonIcon slot="start" icon={saveOutline} />
                Salvar Item
              </IonButton>
              <IonButton expand="block" fill="clear" color="medium" onClick={() => setShowModal(false)}>
                Cancelar
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowModal(true)}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Tarefas;
