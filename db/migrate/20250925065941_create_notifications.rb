class CreateNotifications < ActiveRecord::Migration[8.0]
  def change
    create_table :notifications do |t|
      t.references :subject, null: false, foreign_key: { to_table: :users }
      t.string :action, null: false
      t.references :direct_object, null: false, foreign_key: { to_table: :users }
      t.references :indirect_object, null: false, foreign_key: { to_table: :posts }
      t.boolean :read, default: false

      t.timestamps
    end
    add_index :notifications, [ :subject_id, :direct_object_id, :indirect_object_id ], unique: true
  end
end
