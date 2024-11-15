import { unlink } from "fs";
import { db } from "../../util/util.js";
import Courses from "../../models/Courses.js";
import { Op, Sequelize } from "sequelize";
import Topics from "../../models/Topics.js";

export const createCourse = async (req, res) => {
  try {
    let { path } = req.file;
    let { title, description, price, category } = req.body;

    path = path.replace("public\\", "");

    let course = await Courses.create({
      title,
      description,
      price,
      category,
      thumbnail: path,
    });

    course = await course.save();

    if (!course) {
      if (req.file) unlink(req.file.path, (err) => err && console.log(err));
      return res.status(401).json({
        message: "Error creating course",
      });
    }

    res.status(200).json({
      message: "Course created successfully",
    });
  } catch (error) {
    if (req.file) unlink(req.file.path, (err) => err && console.log(err));
    console.log(error);
    res.status(500).json({
      message: "Error creating course",
    });
  }
};

export const searchAllCourses = async (req, res) => {
  try {
    let { q: searchQuery } = req.query;
    searchQuery += "%";

    let courses = await Courses.findAll({
      where: Sequelize.or(
        {
          title: {
            [Op.like]: searchQuery,
          },
        },
        {
          description: {
            [Op.like]: searchQuery,
          },
        }
      ),
    });

    if (courses.length < 1)
      return res.status(404).json({
        message: "No result found for " + req.query.q,
      });

    res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error searching courses",
    });
  }
};

export const getAllCourse = async (req, res) => {
  try {
    let courses = await Courses.findAll();

    if (courses.length < 1)
      return res.status(404).json({
        message: "No course available",
      });

    res.status(200).json(courses);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error getting courses",
    });
  }
};

export const getAllCourseByCategory = async (req, res) => {
  try {
    let { category } = req.params;

    let courses = await Courses.findAll({
      where: {
        category,
      },
    });

    if (courses.length < 1)
      return res.status(404).json({
        message: "No course found under this category",
      });

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error getting courses",
    });
  }
};

export const createTopic = async (req, res) => {
  try {
    let { path } = req.file;
    let { courseId } = req.params;
    let { title, note, description } = req.body;

    path = path.replace("public\\", "");

    const topic = await Topics.create({
      title,
      note,
      description,
      courseId,
      video: path,
    });

    await topic.save();

    if (!topic) {
      if (req.file) unlink(req.file.path, (err) => err && console.log(err));
      return res.status(401).json({
        message: "Error creating topic",
      });
    }

    res.status(200).json({
      message: "Topic created successfully",
    });
  } catch (error) {
    if (req.file) unlink(req.file.path, (err) => err && console.log(err));
    console.log(error);
    res.status(500).json({
      message:
        "Error creating topic, This may be because you passed an invalid courseId",
    });
  }
};

export const editCourse = async (req, res) => {
  try {
    let path;
    let { courseId } = req.params;
    let { title, description, price, category } = req.body;

    let course = await Courses.findByPk(courseId);
    if (!course) {
      if (req.file) unlink(req.file.path, (err) => err && console.log(err));
      return res.status(404).json({
        message: "Course not available or may be deleted",
      });
    }

    if (req.file) {
      ({ path } = req.file);
      path = path.replace("public\\", "");
      unlink("public\\" + course.thumbnail, (err) => err && console.log(err));
    } else {
      path = course.thumbnail;
    }

    course.update({
      title,
      description,
      price,
      category,
      thumbnail: path,
    });

    if (!course) {
      if (req.file) unlink(req.file.path, (err) => err && console.log(err));
      return res.status(401).json({
        message: "Error editing course",
      });
    }

    res.status(200).json({
      message: "Course edited successfully",
    });
  } catch (error) {
    if (req.file) unlink(req.file.path, (err) => err && console.log(err));
    console.log(error);
    res.status(500).json({
      message: "Error editing course",
    });
  }
};

export const editTopic = async (req, res) => {
  try {
    let path;
    let { courseId, topicId } = req.params;
    let { title, note, description } = req.body;

    let query = `SELECT * FROM topics WHERE id = $1 AND courseid = $2`;
    let values = [topicId, courseId];
    let result = await db.query(query, values);
    let topic = result.rows[0];
    if (!topic) {
      if (req.file) unlink(req.file.path, (err) => err && console.log(err));
      return res.status(404).json({
        message: "Topic not available or may be deleted",
      });
    }

    if (req.file) {
      ({ path } = req.file);
      path = path.replace("public\\", "");
      unlink("public\\" + topic.video, (err) => err && console.log(err));
    } else {
      path = topic.video;
    }

    query = `
    UPDATE topics SET title = $1, description = $2, note = $3, video = $4
    WHERE id = $5
    `;
    values = [title, description, note, path, topicId];
    result = await db.query(query, values);

    if (result.rowCount < 1) {
      if (req.file) unlink(req.file.path, (err) => err && console.log(err));
      return res.status(401).json({
        message: "Error editing topic",
      });
    }

    res.status(200).json({
      message: "Topic edited successfully",
    });
  } catch (error) {
    if (req.file) unlink(req.file.path, (err) => err && console.log(err));
    console.log(error);
    res.status(500).json({
      message: "Error editing topic",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    let { courseId } = req.params;

    const topics = await Topics.findAll({
      where: {
        courseId,
      },
    });

    topics.forEach((topic) => {
      unlink("public\\" + topic.video, (err) => err && console.log(err));
    });

    let course = await Courses.findByPk(courseId);

    let { thumbnail } = course;
    await course.destroy({force: true});
    unlink("public\\" + thumbnail, (err) => err && console.log(err));

    if (result.rowCount < 1)
      return res.status(401).json({
        message: "Error deleting course",
      });

    res.status(200).json({
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error deleting course",
    });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    let { courseId, topicId } = req.params;
    let query = `DELETE FROM topics WHERE id = $1 AND courseid = $2
    RETURNING video
    `;
    let values = [topicId, courseId];
    let result = await db.query(query, values);

    let { video } = result.rows[0];
    unlink("public\\" + video, (err) => err && console.log(err));

    if (result.rowCount < 1)
      return res.status(401).json({
        message: "Error deleting topic",
      });

    res.status(200).json({
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error deleting topic",
    });
  }
};

export const publishCourse = async (req, res) => {
  try {
    let { courseId } = req.params;
    let query = `UPDATE courses SET ispublic = true WHERE id = $1`;
    let values = [courseId];
    let result = await db.query(query, values);

    if (result.rowCount < 1)
      return res.status(401).json({
        message: "Error publishing course",
      });

    res.status(200).json({
      message: "Course is now been published",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error publishing course",
    });
  }
};

export const unpublishCourse = async (req, res) => {
  try {
    let { courseId } = req.params;
    let query = `UPDATE courses SET ispublic = false WHERE id = $1`;
    let values = [courseId];
    let result = await db.query(query, values);

    if (result.rowCount < 1)
      return res.status(401).json({
        message: "Error unpublishing course",
      });

    res.status(200).json({
      message: "Course is now been unpublished",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error unpublishing course",
    });
  }
};
