class NotificationsController < ApplicationController
  before_action :authenticate_user!
  include ActionView::RecordIdentifier

  def index
    @notifications = Notification.eager_load(:direct_object, :subject, :indirect_object).order(created_at: :desc).where(direct_object_id: current_user.id).page(1).per(20)
  end

  def mark_all_as_read
    @notifications = current_user.unread_notifications
    @notifications.update_all(read: true)
    redirect_to notifications_path
  end
end
