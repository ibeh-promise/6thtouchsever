import Admins from "../../models/admins.js";

export const getAdminProfile = async (req, res) => {
  try {
    let { id } = req.admin;

    let admin = await Admins.findByPk(id);

    if (!admin)
      return res.status(404).json({
        message: "Admin not found",
      });

    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error getting admin profile",
    });
  }
};

export const editAdminProfile = async (req, res) => {
  try {
    let { id } = req.admin;
    let { firstName, lastName, email } = req.body;

    let admin = await Admins.findByPk(id);

    if (!admin)
      return res.status(404).json({
        message: "Admin not found",
      });

    admin = await admin.update({
      firstName,
      lastName,
      email,
    });

    if (admin.isNewRecord)
      return res.status(404).json({
        message: "Unable to edit course",
      });
    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error editing admin profile",
    });
  }
};

export const deleteAdminProfile = async (req, res) => {
  try {
    let { id } = req.admin;
    let { firstName, lastName, email } = req.body;

    let admin = await Admins.findByPk(id);

    if (!admin)
      return res.status(404).json({
        message: "Admin not found",
      });

    admin = await admin.destroy({ force: true });

    if (admin.isNewRecord)
      return res.status(404).json({
        message: "Unable to edit course",
      });
    res.status(200).json(admin);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error editing admin profile",
    });
  }
};