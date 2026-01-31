require "test_helper"

class TarefasControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get tarefas_index_url
    assert_response :success
  end

  test "should get new" do
    get tarefas_new_url
    assert_response :success
  end

  test "should get show" do
    get tarefas_show_url
    assert_response :success
  end
end
