import Amenities from "../models/amenity.js";
import path from "path";
import fs from "fs";
import Sections from "../models/sections.js";

//------------------------- ABOUT US ------------------------- //

export const createAboutUs = async (req, res) => {
  try {
    const { aboutUs, folder } = req.body;
    const imageUrls = {};

    // Process uploaded files and generate image URLs
    if (req.files) {
      for (const [fieldname, files] of Object.entries(req.files)) {
        imageUrls[fieldname] = files.map(
          (file) => `/images/${folder.toLowerCase()}/${file.filename}`
        );
      }
    }

    let section = await Sections.findOne();

    if (!section) {
      section = new Sections();
    }
    if (!section.aboutUs) {
      section.aboutUs = {};
    }
    if (aboutUs && aboutUs.firstSection) {
      section.aboutUs.firstSection = {
        title: aboutUs.firstSection.title,
        description: aboutUs.firstSection.description,
        imageUrl: imageUrls.sectionOneImage
          ? imageUrls.sectionOneImage[0]
          : section.aboutUs.firstSection?.imageUrl,
      };
    }

    if (aboutUs.secondSection) {
      section.aboutUs.secondSection = {
        ...aboutUs.secondSection,
        cards: aboutUs.secondSection.cards.map((card, index) => {
          const imageFieldName = `card${index + 1}Image`;
          return {
            ...card,  
            ...aboutUs.secondSection.cards[index],
            imageUrl: imageUrls[imageFieldName]
              ? imageUrls[imageFieldName][0]
              : card.imageUrl,
          };
        }),
      };
    }

    if (aboutUs.thirdSection) {
      section.aboutUs.thirdSection = {
        ...aboutUs.thirdSection,
        imageUrl: imageUrls.sectionThirdImage
          ? imageUrls.sectionThirdImage[0]
          : section.aboutUs.thirdSection?.imageUrl,
      };
    }

    await section.save();

    res
      .status(200)
      .json({ data: section.aboutUs, message: "Created Successfully" });
  } catch (error) {
    console.error("Error creating/updating About Us section:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get about us page
export const getAboutUs = async (req, res) => {
  try {
    const section = await Sections.findOne().sort({ createdAt: 1 });
    if (section && section.aboutUs) {
      res.status(200).json(section.aboutUs);
    } else {
      res.status(404).json({ message: "No About Us section found" });
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
      if (imageUrls.knowMoreSectionImage) {
        const mergedknowMoreSection = HomePage.knowMoreSection
          ? { ...HomePage.knowMoreSection }
          : { ...section.HomePage.knowMoreSection };

        section.HomePage.knowMoreSection = {
          ...mergedknowMoreSection,
          imageUrl: imageUrls.knowMoreSectionImage[0],
        };
      }
      if (imageUrls.hostSectionImage) {
        const mergedhostSection = HomePage.hostSection
          ? { ...HomePage.hostSection }
          : { ...section.HomePage.hostSection };

        section.HomePage.hostSection = {
          ...mergedhostSection,
          imageUrl: imageUrls.hostSectionImage[0],
        };
      }
      if (imageUrls.aboutUsSectionImage) {
        const mergedaboutUsSection = HomePage.aboutUsSection
          ? { ...HomePage.aboutUsSection }
          : { ...section.HomePage.aboutUsSection };

        section.HomePage.aboutUsSection = {
          ...mergedaboutUsSection,
          imageUrl: imageUrls.aboutUsSectionImage[0],
        };
      }

      section = Object.assign(section, HomePage);

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

      HomePage.featureSection = {
        ...HomePage.featureSection,
        imageUrl:
          imageUrls.FeatureSectionImage &&
          imageUrls.FeatureSectionImage.length > 0
            ? imageUrls.FeatureSectionImage[0]
            : null,
      };

      HomePage.knowMoreSection = {
        ...HomePage.knowMoreSection,
        imageUrl:
          imageUrls.knowMoreSectionImage &&
          imageUrls.knowMoreSectionImage.length > 0
            ? imageUrls.knowMoreSectionImage[0]
            : null,
      };

      HomePage.aboutUsSection = {
        ...HomePage.aboutUsSection,
        imageUrl:
          imageUrls.aboutUsSectionImage &&
          imageUrls.aboutUsSectionImage.length > 0
            ? imageUrls.aboutUsSectionImage[0]
            : null,
      };

      HomePage.collectionSection = HomePage.collectionSection || [];
      HomePage.experiencesSection = HomePage.experiencesSection || [];
      HomePage.destinationSection = HomePage.destinationSection || [];

      section.HomePage = HomePage;

      await section.save();
    }

    res
      .status(200)
      .json({ data: section.HomePage, message: "Created Successfully" });
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

    if (section && section.HomePage) {
      res.status(200).json(section.HomePage);
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

    res.status(200).json({
      data: section.PrivacyPolicyPage,
      message: "Created Successfully",
    });
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

    res.status(200).json({
      data: section.RefundPolicyPage,
      message: "Created Successfully",
    });
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

    res
      .status(200)
      .json({ data: section.TermsPolicyPage, message: "Created Successfully" });
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
