class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  validates :username, presence: true, uniqueness: { case_sensitive: false }
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable
  has_many :likes, dependent: :destroy
  has_many :liked_posts, through: :likes, source: :post
  # People this user is following
  has_many :active_follows, class_name: "Follow", foreign_key: "follower_id", dependent: :destroy
  has_many :followings, through: :active_follows, source: :user
  # People following this user
  has_many :passive_follows, class_name: "Follow", foreign_key: "user_id", dependent: :destroy
  has_many :followers, through: :passive_follows, source: :follower
  has_many :comments, dependent: :destroy
  has_many :shares, dependent: :destroy
  has_one_attached :avatar
  has_many :posts, foreign_key: :author_id
  has_many :sent_messages, class_name: "Message", foreign_key: "sender_id", dependent: :destroy
  has_many :received_messages, class_name: "Message", foreign_key: "recipient_id", dependent: :destroy
  has_many :conversations_as_sender, class_name: "Conversation", foreign_key: "sender_id"
  has_many :conversations_as_recipient, class_name: "Conversation", foreign_key: "recipient_id"
  has_many :notifications, foreign_key: "direct_object_id", dependent: :destroy

  def unread_notifications
    notifications.where(read: false)
  end

  def conversations
    Conversation.where("sender_id = ? OR recipient_id = ?", id, id)
  end

  def unread_messages_count
    received_messages.where(read: nil).count
  end

  def read_all_notifications
    notifications.order(created_at: :desc).first.read
  end

end
