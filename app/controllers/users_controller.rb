class UsersController < ApplicationController
  before_action :authenticate_user!, only: [:edit, :update]
  before_action :set_user, only: [:edit, :update]
  def edit
    @user = current_user
  end

  def update
    if params[:user][:remove_avatar] == "1"
      @user.avatar.purge
    end

    if @user.update(user_params.except(:remove_avatar))
      redirect_to @user, notice: "Profile updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def show
    @user = User.eager_load(:posts).find(params[:id])
  end

  private

  def set_user
    @user = current_user
  end

  def user_params
    params.require(:user).permit(:username, :avatar, :remove_avatar)
  end
end
