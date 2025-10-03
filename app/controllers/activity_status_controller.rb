class FollowsController < ApplicationController
  include ActionView::RecordIdentifier
  before_action :authenticate_user!, only: [ :create, :destroy ]

  def show
    @user = User.find(params[:profile_id])
    @followers = @user.followers
    render partial: "users/followers_modal", formats: [ :turbo_stream ]
  end
  def create
    @user = User.find(params[:profile_id])
    Follow.new(user_id: @user.id, follower_id: current_user.id).save!
    interact
  end

  def destroy
    @user = User.find(params[:profile_id])
    Follow.find_by(user_id: @user.id, follower_id: current_user.id).destroy!
    interact
  end

  private

  def interact
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: [
          turbo_stream.replace(dom_id(@user, :followers_count), partial: "users/followers_count", locals: { user: @user }),
          turbo_stream.replace(dom_id(@user, :follow_button), partial: "users/follow_button", locals: { user: @user })
        ]
      end
      format.html { redirect_to root_path }
    end
  end
end
