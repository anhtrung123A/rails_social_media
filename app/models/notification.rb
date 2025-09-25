class Notification < ApplicationRecord
  belongs_to :subject, class_name: "User"
  belongs_to :direct_object, class_name: "User"
  belongs_to :indirect_object, class_name: "Post"
  validates :action, presence: true
  after_create_commit { broadcast_via_action_cable }

  def broadcast_via_action_cable
    ActionCable.server.broadcast("notifications_#{direct_object_id}", {
      subject: subject,
      direct_object: direct_object,
      indirect_object: indirect_object,
      action: action,
      created_at: created_at.strftime("%H:%M"),
      id: id
    })
  end
end
