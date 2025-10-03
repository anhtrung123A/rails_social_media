# app/services/redis_service.rb
class RedisService
  class << self
    def client
      @client ||= Redis.new(url: ENV.fetch("REDIS_URL", "redis://localhost:6379/0"))
    end

    # Store user as online (with 5-minute expiry)
    def set_user_online(user_id)
      client.setex("user:#{user_id}:online", 5.minutes, "true")
      client.setex("user:#{user_id}:last_seen", 1.month, Time.current.to_s)
    end

    # Mark user as offline
    def set_user_offline(user_id)
      client.del("user:#{user_id}:online")
      client.setex("user:#{user_id}:last_seen", 1.month, Time.current.to_s)
    end

    # Check if user is online
    def user_online?(user_id)
      client.exists?("user:#{user_id}:online")
    end

    # Get last seen timestamp
    def user_last_seen(user_id)
      client.get("user:#{user_id}:last_seen")
    end

    # Get online status for multiple users
    def users_online_status(user_ids)
      user_ids.each_with_object({}) do |id, hash|
        hash[id] = user_online?(id)
      end
    end
  end
end
