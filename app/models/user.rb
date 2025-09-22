class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable, :confirmable
  has_many :likes, dependent: :destroy
  has_many :liked_post, through: :likes, source: :post
  has_one_attached :avatar
  has_many :posts, foreign_key: :author_id
  validates :username, presence: true, uniqueness: { case_sensitive: false }
end
