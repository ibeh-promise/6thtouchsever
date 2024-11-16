import Users from "../../models/users.js";

export const getMyProfile = async (req, res) => {
  try {
    let { id } = req.user;

    let user = await Users.findByPk(id);

    if (!user)
      return res.status(404).json({
        message: "User not found",
      });

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error getting profile",
      error,
    });
  }
};

export const editMyProfile = async (req, res) => {
  try {
    let { id } = req.user;
    let { firstName, lastName, email } = req.body;

    let [affectedRows] = await Users.update(
      {
        firstName,
        lastName,
        email,
      },
      {
        where: {
          id,
        },
      }
    );

    if (affectedRows < 1)
      return res.status(404).json({
        message: "User profile not edited",
      });

    res.status(200).json({
      message: "User profile edited successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error editing profile",
      error,
    });
  }
};

export const deleteMyProfile = async (req, res) => {
  try {
    let { id } = req.user;

    let deletedRows = await Users.destroy({
      where: { id },
      force: true,
    });

    if (deletedRows < 1)
      return res.status(404).json({
        message: "User account not deleted",
      });

    res.status(200).json({
      message: "User account deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error deleting profile",
      error,
    });
  }
};