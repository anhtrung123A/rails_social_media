class AddContentToComments < ActiveRecord::Migration[8.0]
  def change
    add_column :comments, :content, :string, null: false
  end
end
