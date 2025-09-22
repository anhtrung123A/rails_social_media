class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
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
  has_one_attached :avatar
  has_many :posts, foreign_key: :author_id
  validates :username, presence: true, uniqueness: { case_sensitive: false }
end
