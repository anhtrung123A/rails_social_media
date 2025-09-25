class NotificationsController < ApplicationController
  def show
    @notifications = Notification.eager_load(:direct_object, :subject, :indirect_object).order(created_at: :desc).where(direct_object_id: params[:id])
    render json: {data: @notifications}
  end
end
