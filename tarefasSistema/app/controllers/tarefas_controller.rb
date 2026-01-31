class TarefasController < ApplicationController
  def index
    @tarefas = Tarefa.all
  end

  def show
    @tarefa = Tarefa.find(params[:id])
  end

  def new
    @tarefa = Tarefa.new
  end

  def create
    @tarefa = Tarefa.new(tarefa_params)
    if @tarefa.save
      redirect_to tarefas_path
    else
      render :new
    end
  end

  private

  def tarefa_params
    params.require(:tarefa).permit(:nometarefa, :custo, :data)
  end
end
