module CreateAndSendNotification
  include ActiveSupport::Concern

  def create_and_send_notification_to(subject, direct_object, indirect_object, action)
    if direct_object == subject
      puts "can't interact with your self"
    else
      notification = Notification.new(subject: subject, direct_object: direct_object, indirect_object: indirect_object, action: action)
      notification.save
    end
  end
end
