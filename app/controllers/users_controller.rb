class UsersController < ApplicationController
  include SetCurrentUser
  before_action :authenticate_user!, only: [ :edit, :update ]
  before_action :set_user, only: [ :edit, :update ]
  def edit
    @user = current_user
  end

  def update
    if params[:user][:remove_avatar] == "1"
      @user.avatar.purge
    end

    if @user.update(user_params.except(:remove_avatar))
      redirect_to profile_url(@user), notice: "Profile updated successfully."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def show
    @user = User.eager_load(:posts).find(params[:id])
    @posts = @user.posts.order(created_at: :desc).page(params[:page]).per(5)

    respond_to do |format|
      format.html
      format.turbo_stream
    end
  end

  private

  def user_params
    params.require(:user).permit(:username, :avatar, :remove_avatar)
  end
end
