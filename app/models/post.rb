class Post < ApplicationRecord
  belongs_to :author, class_name: "User", foreign_key: "author_id"
  has_many :likes, dependent: :destroy
  has_many :liked_user, through: :likes, source: :user
  has_many :comments
  has_many_attached :images
  validates :description, presence: true
end
