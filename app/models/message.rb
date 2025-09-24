# app/models/message.rb
class Message < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User"
  belongs_to :conversation

  validates :content, presence: true

  after_create_commit { broadcast_via_action_cable }

  def broadcast_via_action_cable
    ActionCable.server.broadcast("messages_#{conversation_id}", {
      message: content,
      sender: sender.full_name,
      conversation_id: conversation_id,
      created_at: created_at.strftime("%H:%M"),
      id: id
    })
  end

  def mark_as_read!
    update(read: true) unless read?
  end
end
