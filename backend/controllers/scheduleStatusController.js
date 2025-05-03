import Topic from "../models/Topic.js";
import Blog from "../models/Blog.js";

export const getScheduledStatuses = async (req, res) => {
  try {
    const topics = await Topic.find()
      .populate("brandId", "name")
      .exec();

    const enrichedTopics = await Promise.all(
      topics.map(async (topic) => {
        const blog = await Blog.findOne({ topic: topic._id });

        return {
          topicId: topic._id,
          title: topic.title,
          brandName: topic.brandId?.name || "Unknown",
          scheduleTime: topic.scheduleTime,
          status: topic.status,
          used: topic.used,
          platforms: topic.platforms,
          blogStatus: blog
            ? blog.isPublished
              ? "Published"
              : "Scheduled"
            : topic.used
            ? "Blog Saved but not Published"
            : "Pending",
        };
      })
    );

    res.status(200).json(enrichedTopics);
  } catch (error) {
    console.error("❌ Error fetching schedule statuses:", error.message);
    res.status(500).json({ error: "Failed to fetch schedule statuses." });
  }
};
