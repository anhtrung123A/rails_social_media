module CreateAndSendNotification
  include ActiveSupport::Concern

  def create_and_send_notification_to(subject, direct_object, indirect_object, action)
    if direct_object == subject
      puts "can't like your self"
    else
      NotificationsJob.perform_async(subject.id, direct_object.id, indirect_object.id, action)
    end
  end
end