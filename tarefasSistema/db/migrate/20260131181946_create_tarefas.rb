class CreateTarefas < ActiveRecord::Migration[8.0]
  def change
    create_table :tarefas do |t|
      t.string :nometarefa
      t.float :custo
      t.date :data

      t.timestamps
    end
  end
end
