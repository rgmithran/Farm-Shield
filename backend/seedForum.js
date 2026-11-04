const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const ForumPost = require("./models/ForumPost");

const initialDiscussions = [
    {
        author: "ramanathan.farmer@gmail.com",
        title: "Recommended organic remedy for Yellow Leaf Curl on Tomato in Pollachi?",
        content: "Noticed upward leaf curling and stunted growth in my 40-day old tomato crop. Is 5% Neem Seed Kernel Extract (NSKE) effective against whiteflies, or should I install yellow sticky traps?",
        category: "Pest & Disease Control",
        cropTag: "Tomato",
        likes: 12,
        likedBy: ["farmer@farm.com", "selvam.agri@gmail.com"],
        replies: [
            {
                author: "selvam.agri@gmail.com",
                comment: "Yes! 5% NSKE works well if sprayed on leaf undersides. Also install at least 15 yellow sticky traps per acre to capture the vector whiteflies.",
                date: new Date(Date.now() - 3600000 * 24)
            },
            {
                author: "admin@farm.com",
                comment: "Check our AI Plant Pathology tab! You can upload a photo of the affected leaf for tailored chemical/organic treatment ratios.",
                date: new Date(Date.now() - 3600000 * 12)
            }
        ],
        createdAt: new Date(Date.now() - 3600000 * 48)
    },
    {
        author: "muthu.thanjavur@agri.in",
        title: "Paddy Kuruvai Season - Direct Seeding vs Machine Transplantation yields",
        content: "Planning for the upcoming Kuruvai season in Thanjavur delta. We compared drum seeder direct sowing with mechanical transplanters. Water consumption dropped by 22% with DSR.",
        category: "Agronomy & Sowing",
        cropTag: "Rice",
        likes: 18,
        likedBy: ["farmer@farm.com", "arun.tnau@gmail.com"],
        replies: [
            {
                author: "arun.tnau@gmail.com",
                comment: "Good observation. Just ensure effective pre-emergence weed management (Pyrazosulfuron-ethyl) within 3-5 days after direct seeding.",
                date: new Date(Date.now() - 3600000 * 8)
            }
        ],
        createdAt: new Date(Date.now() - 3600000 * 36)
    },
    {
        author: "suresh.erode@yahoo.com",
        title: "100% Subsidy on Micro Irrigation Scheme (TN MI) - Application procedure",
        content: "Successfully received approval for drip irrigation in my 3-acre turmeric plot through the Agrisnet portal. Small/Marginal farmers receive 100% government subsidy.",
        category: "Government Schemes",
        cropTag: "Turmeric",
        likes: 24,
        likedBy: ["farmer@farm.com"],
        replies: [
            {
                author: "kavitha.coimbatore@gmail.com",
                comment: "What documents are required for tenant farmers? Do we need a registered lease deed?",
                date: new Date(Date.now() - 3600000 * 4)
            }
        ],
        createdAt: new Date(Date.now() - 3600000 * 18)
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        console.log("Seeding initial community forum discussions...");
        await ForumPost.deleteMany({});
        await ForumPost.insertMany(initialDiscussions);
        console.log("Successfully seeded forum discussions!");
        process.exit();
    })
    .catch(err => {
        console.error("Seeding forum error:", err);
        process.exit(1);
    });
