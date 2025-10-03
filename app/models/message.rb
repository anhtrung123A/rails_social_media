# app/models/message.rb
class Message < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User"
  belongs_to :conversation
  scope :latest_per_conversation, -> {
    joins(
      "INNER JOIN (SELECT sender_id, recipient_id, MAX(created_at) as max_created_at
                   FROM messages
                   GROUP BY sender_id, recipient_id) latest
                   ON messages.sender_id = latest.sender_id
                   AND messages.recipient_id = latest.recipient_id
                   AND messages.created_at = latest.max_created_at"
    )
  }
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
    ActionCable.server.broadcast("user_#{recipient.id}_messages", { type: "new_message",
      conversation_id: conversation.id,
      sender_name: sender.full_name,
      message_preview: content.truncate(50)
    })
  end

  def mark_as_read!
    update(read: true) unless read?
  end
end
