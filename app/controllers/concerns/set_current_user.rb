module SetCurrentUser
  include ActiveSupport::Concern

  def set_user
    @user = current_user
  end
end
