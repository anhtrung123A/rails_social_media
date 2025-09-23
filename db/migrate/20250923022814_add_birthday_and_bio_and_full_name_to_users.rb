class AddBirthdayAndBioAndFullNameToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :birthday, :date
    add_column :users, :bio, :string
    add_column :users, :full_name, :string, null: false, default: ""
  end
end
