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
          // ...aboutUs,
          firstSection: {
            ...aboutUs.firstSection,
            imageUrl: imageUrls.sectionOneImage
              ? imageUrls.sectionOneImage[0]
              : aboutUs.firstSection.imageUrl,
          },
          thirdSection: {
            ...aboutUs.thirdSection,
            imageUrl: imageUrls.sectionThirdImage
              ? imageUrls.sectionThirdImage[0]
              : aboutUs.thirdSection.imageUrl,
          },
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
      const { aboutUs } = section;
    } else {
      res.status(404).json({ message: "No aboutUs found" });
    }

    if (aboutUs) {
      res.status(200).json(aboutUs);
    } else {
      res.status(404).json({ message: "No aboutUs found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//------------------------- ABOUT US ------------------------- //

//------------------------- HOME PAGE ------------------------- //

export const createHomePage = async (req, res) => {
  try {
    const { HomePage, folder } = req.body;
    const imageUrls = {};
    let section = await Sections.findOne();

    if (req.files) {
      for (const [fieldname, files] of Object.entries(req.files)) {
        imageUrls[fieldname] = files.map(
          (file) => `/images/${folder.toLowerCase()}/${file.filename}`
        );
      }
    }

    if (section.HomePage) {
      if (imageUrls.HeroSectionImage) {
        section.HomePage.heroSection = {
          ...section.HomePage.heroSection,
          imageUrl: imageUrls.HeroSectionImage[0],
        };
      }
      if (imageUrls.FeatureSectionImage) {
        const mergedFeatureSection = HomePage.featureSection
          ? { ...HomePage.featureSection }
          : { ...section.HomePage.featureSection };

        section.HomePage.featureSection = {
          ...mergedFeatureSection,
          imageUrl: imageUrls.FeatureSectionImage[0],
        };

      }

      section = Object.assign(section, HomePage);
      console.log(section);

      if (HomePage.collectionSection) {
        section.HomePage.collectionSection = HomePage.collectionSection;
      }
      if (HomePage.destinationSection) {
        section.HomePage.experiencesSection = HomePage.experiencesSection;
      }
      if (HomePage.destinationSection) {
        section.HomePage.destinationSection = HomePage.destinationSection;
      }
      await section.save();
    } else {
      HomePage.heroSection.imageUrl =
        imageUrls.HeroSectionImage && imageUrls.HeroSectionImage.length > 0
          ? imageUrls.HeroSectionImage[0]
          : null;

      HomePage.collectionSection = HomePage.collectionSection || [];
      HomePage.experiencesSection = HomePage.experiencesSection || [];
      HomePage.destinationSection = HomePage.destinationSection || [];

      section.HomePage = HomePage;

      await section.save();
    }

    res.status(200).json(section);
  } catch (error) {
    console.error("Error creating/updating HomePage section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
// Get home page
export const getHomePage = async (req, res) => {
  try {
    const section = await Sections.findOne()
      .sort({ createdAt: 1 })
      .populate("HomePage.collectionSection")
      .populate("HomePage.experiencesSection")
      .populate("HomePage.destinationSection");
    const { HomePage } = section;

    if (HomePage) {
      res.status(200).json(HomePage);
    } else {
      res.status(404).json({ message: "No HomePage found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//------------------------- HOME PAGE ------------------------- //

//------------------------- Privacy Policy Page ------------------------- //

export const createPrivacyPolicyPage = async (req, res) => {
  try {
    const { privacyPolicyPage } = req.body;
    let section = await Sections.findOne();
    if (section) {
      section.PrivacyPolicyPage = privacyPolicyPage;
      await section.save();
    } else {
      section = new Sections(privacyPolicyPage);
      await section.save();
    }

    res.status(200).json(section);
  } catch (error) {
    console.error(
      "Error creating/updating createPrivacyPolicyPage section:",
      error
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get about us page
export const getPrivacyPolicyPage = async (req, res) => {
  try {
    const section = await Sections.findOne().sort({ createdAt: 1 });
    const { PrivacyPolicyPage } = section;

    if (PrivacyPolicyPage) {
      res.status(200).json(PrivacyPolicyPage);
    } else {
      res.status(404).json({ message: "No privacyPolicyPage found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//-------------------------  Privacy Policy Page ------------------------- //

//------------------------- Refund Policy Page ------------------------- //

export const createRefundPolicyPage = async (req, res) => {
  try {
    const { refundPolicyPage } = req.body;
    let section = await Sections.findOne();
    if (section) {
      section.RefundPolicyPage = refundPolicyPage;
      await section.save();
    } else {
      section = new Sections(refundPolicyPage);
      await section.save();
    }

    res.status(200).json(section);
  } catch (error) {
    console.error(
      "Error creating/updating createRefundPolicyPage section:",
      error
    );
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get about us page
export const getRefundPolicyPage = async (req, res) => {
  try {
    const section = await Sections.findOne().sort({ createdAt: 1 });
    const { RefundPolicyPage } = section;

    if (RefundPolicyPage) {
      res.status(200).json(RefundPolicyPage);
    } else {
      res.status(404).json({ message: "No RefundPolicyPage found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//-------------------------  Refund Policy Page ------------------------- //
//------------------------- Terms Policy Page ------------------------- //

export const createTermsPolicyPage = async (req, res) => {
  try {
    const { termsPolicyPage } = req.body;
    let section = await Sections.findOne();
    if (section) {
      section.TermsPolicyPage = termsPolicyPage;
      await section.save();
    } else {
      section = new Sections(termsPolicyPage);
      await section.save();
    }

    res.status(200).json(section);
  } catch (error) {
    console.error("Error creating/updating TermsPolicyPage section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get about us page
export const getTermsPolicyPage = async (req, res) => {
  try {
    const section = await Sections.findOne().sort({ createdAt: 1 });
    const { TermsPolicyPage } = section;

    if (TermsPolicyPage) {
      res.status(200).json(TermsPolicyPage);
    } else {
      res.status(404).json({ message: "No TermsPolicyPage found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
//-------------------------  Terms Policy Page ------------------------- //
