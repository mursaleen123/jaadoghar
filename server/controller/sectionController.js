import Amenities from "../models/amenity.js";
import path from "path";
import fs from "fs";
import Sections from "../models/sections.js";


//------------------------- ABOUT US ------------------------- //

export const createAboutUs = async (req, res) => {
  try {
    const { aboutUs, folder } = req.body;
    const imageUrls = {};

    if (req.files) {
      for (const [fieldname, files] of Object.entries(req.files)) {
        imageUrls[fieldname] = files.map(
          (file) => `/images/${folder.toLowerCase()}/${file.filename}`
        );
      }
    }

    let section = await Sections.findOne();

    if (section) {
      // Update existing section
      if (imageUrls.sectionOneImage) {
        section.aboutUs.firstSection = {
          ...section.aboutUs.firstSection,
          imageUrl: imageUrls.sectionOneImage[0],
        };
      }
      if (imageUrls.sectionThirdImage) {
        section.aboutUs.thirdSection = {
          ...section.aboutUs.thirdSection,
          imageUrl: imageUrls.sectionThirdImage[0],
        };
      }

      // Update second section cards with images
      section.aboutUs.secondSection.cards =
        section.aboutUs.secondSection.cards.map((card, index) => {
          const imageFieldName = `card${index + 1}Image`;
          return {
            ...card,
            imageUrl: imageUrls[imageFieldName]
              ? imageUrls[imageFieldName][0]
              : card.imageUrl,
          };
        });

      section.aboutUs = { ...section.aboutUs, ...aboutUs };
      await section.save();
    } else {
      // Create new section
      const newSectionData = {
        aboutUs: {
          ...aboutUs,
          firstSection: imageUrls.sectionOneImage
            ? { imageUrl: imageUrls.sectionOneImage[0] }
            : {},
          thirdSection: imageUrls.sectionThirdImage
            ? { imageUrl: imageUrls.sectionThirdImage[0] }
            : {},
          secondSection: {
            ...aboutUs.secondSection,
            cards: aboutUs.secondSection.cards.map((card, index) => ({
              ...card,
              imageUrl: imageUrls[`card${index + 1}Image`]
                ? imageUrls[`card${index + 1}Image`][0]
                : card.imageUrl,
            })),
          },
        },
      };

      section = new Sections(newSectionData);
      await section.save();
    }

    res.status(200).json(section);
  } catch (error) {
    console.error("Error creating/updating About Us section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get about us page
export const getAboutUs = async (req, res) => {
  try {
    const section = await Sections.findOne().sort({ createdAt: 1 }); 
    if (section) {
      res.status(200).json(section);
    } else {
      res.status(404).json({ message: "No sections found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//------------------------- ABOUT US ------------------------- //
