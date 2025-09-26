class NotificationsJob
  include Sidekiq::Job

  def perform(subject_id, direct_object_id, indirect_object_id, action)
    notification = Notification.new(subject_id: subject_id, direct_object_id: direct_object_id, indirect_object_id: indirect_object_id, action: action)
    begin
      notification.save
      notification.broadcast_via_action_cable
    rescue
      puts "interacted"
    end
    
  end
end
