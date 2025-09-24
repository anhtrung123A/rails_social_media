class Conversation < ApplicationRecord
  belongs_to :sender, class_name: "User"
  belongs_to :recipient, class_name: "User"

  has_many :messages, dependent: :destroy

  validates :sender_id, uniqueness: { scope: :recipient_id }

  scope :between, ->(sender_id, recipient_id) do
    where("(sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)",
          sender_id, recipient_id, recipient_id, sender_id)
  end

  def other_user(current_user)
    sender == current_user ? recipient : sender
  end

  def unread_messages_count_for(user)
    messages.where(recipient_id: user.id, read: false).count
  end
end
