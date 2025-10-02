class Notification < ApplicationRecord
  belongs_to :subject, class_name: "User"
  belongs_to :direct_object, class_name: "User"
  belongs_to :indirect_object, class_name: "Post"
  after_create_commit { broadcast_via_action_cable }
  validates :action, presence: true

  def broadcast_via_action_cable
    puts 1111111
    ActionCable.server.broadcast("notifications_#{direct_object_id}", {
      message: message,
      subject: subject,
      direct_object: direct_object,
      indirect_object: indirect_object,
      action: action,
      created_at: created_at.strftime("%H:%M"),
      id: id
    })
  end

  def message
    case action
    when "like"
      "#{subject.full_name || subject.username} liked your post"
    when "comment"
      "#{subject.full_name || subject.username} commented on your post"
    when "follow"
      "#{subject.full_name || subject.username} started following you"
    when "share"
      "#{subject.full_name || subject.username} shared your post"
    else
      "#{subject.full_name || subject.username} #{action} on your post"
    end
  end

  def url
    case action
    when "liked", "commented"
      post_path(indirect_object)
    when "followed"
      user_path(subject)
    when "mentioned"
      post_path(indirect_object)
    else
      "#"
    end
  end
end
