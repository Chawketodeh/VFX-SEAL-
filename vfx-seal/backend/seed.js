require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vendor = require('./models/Vendor');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB for seeding');

        // Seed Admin
        const existingAdmin = await User.findOne({ email: 'admin@vfxseal.com' });
        if (!existingAdmin) {
            await User.create({
                name: 'VOE Administrator',
                company: 'VFX Seal',
                email: 'admin@vfxseal.com',
                passwordHash: 'Admin123!',
                country: 'France',
                roleInCompany: 'Platform Administrator',
                role: 'ADMIN',
                status: 'APPROVED',
            });
            console.log('👤 Admin account created: admin@vfxseal.com / Admin123!');
        } else {
            console.log('👤 Admin already exists, skipping');
        }

        // Seed Sample Vendors
        const vendorCount = await Vendor.countDocuments();
        if (vendorCount === 0) {
            const sampleVendors = [
                {
                    name: 'Pixel Storm Studios',
                    country: 'United Kingdom',
                    size: 'Large',
                    foundedYear: 2008,
                    website: 'https://pixelstorm.example.com',
                    demoReel: 'https://vimeo.com/example1',
                    shortDescription: 'Award-winning VFX studio specializing in feature film CGI, creature design, and large-scale environment creation. Known for delivering Hollywood-grade visuals.',
                    services: ['CGI', 'Compositing', 'Creature FX', 'Environment', 'Matchmove', 'Roto & Paint'],
                    badgeVOE: 'Gold',
                    globalScore: 9.2,
                    assessment: [
                        {
                            sectionName: 'Pipeline & Technology',
                            score: 9.5,
                            validatedSkills: ['USD Pipeline', 'Custom Tool Development', 'Cloud Rendering', 'Real-time Preview'],
                            unverifiedSkills: ['AI-Assisted Compositing'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Team & Organization',
                            score: 9.0,
                            validatedSkills: ['Dedicated Supervisors', 'Structured Onboarding', 'Cross-department Workflow'],
                            unverifiedSkills: ['24/7 Support Team'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Quality Assurance',
                            score: 9.8,
                            validatedSkills: ['Multi-stage QC', 'Color Management', 'Reference Matching', 'Dailies Review Process'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Security & Compliance',
                            score: 9.0,
                            validatedSkills: ['TPN Certified', 'ISO 27001', 'GDPR Compliant', 'Encrypted Transfer'],
                            unverifiedSkills: ['SOC 2 Type II'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Delivery & Communication',
                            score: 9.3,
                            validatedSkills: ['ShotGrid Integration', 'Daily Reports', 'Milestone Tracking', 'Client Review Portal'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Scalability',
                            score: 9.5,
                            validatedSkills: ['500+ Artist Capacity', 'Multi-site Operation', 'Burst Capacity'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['GPU Farm'],
                        },
                        {
                            sectionName: 'Creative Leadership',
                            score: 9.0,
                            validatedSkills: ['Art Direction', 'Look Development', 'Creative Problem Solving'],
                            unverifiedSkills: ['Virtual Production'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Financial Stability',
                            score: 8.8,
                            validatedSkills: ['Audited Financials', 'Insurance Coverage', 'Stable Revenue Growth'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['Public Listing'],
                        },
                        {
                            sectionName: 'Environmental & Social',
                            score: 9.0,
                            validatedSkills: ['Carbon Offset Program', 'Diversity Initiatives', 'Mental Health Support'],
                            unverifiedSkills: ['B-Corp Certification'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Client Satisfaction',
                            score: 9.5,
                            validatedSkills: ['95%+ Repeat Client Rate', 'NPS Score > 70', 'Award-winning Projects'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Innovation & R&D',
                            score: 9.2,
                            validatedSkills: ['R&D Department', 'Published Papers', 'Patent Holdings', 'Open Source Contributions'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                    ],
                    pdfReport: { filePath: '', visibility: 'members' },
                },
                {
                    name: 'Nova Digital Arts',
                    country: 'Canada',
                    size: 'Medium',
                    foundedYear: 2015,
                    website: 'https://novadigital.example.com',
                    demoReel: 'https://vimeo.com/example2',
                    shortDescription: 'Boutique VFX company focused on high-end television and streaming content. Agile team delivering exceptional compositing and FX work.',
                    services: ['Compositing', 'FX Simulation', 'DMP', 'Color Grading', 'Roto & Paint'],
                    badgeVOE: 'Silver',
                    globalScore: 7.8,
                    assessment: [
                        {
                            sectionName: 'Pipeline & Technology',
                            score: 7.5,
                            validatedSkills: ['Nuke Studio Pipeline', 'Houdini FX', 'ShotGrid'],
                            unverifiedSkills: ['Custom Pipeline Tools'],
                            nonValidatedSkills: ['USD Pipeline'],
                        },
                        {
                            sectionName: 'Team & Organization',
                            score: 8.0,
                            validatedSkills: ['Experienced Supervisors', 'Agile Methodology'],
                            unverifiedSkills: ['Remote Team Management'],
                            nonValidatedSkills: ['24/7 Coverage'],
                        },
                        {
                            sectionName: 'Quality Assurance',
                            score: 8.2,
                            validatedSkills: ['Internal QC Process', 'Color Pipeline'],
                            unverifiedSkills: ['Automated QC Tools'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Security & Compliance',
                            score: 7.0,
                            validatedSkills: ['TPN Certified', 'VPN Access'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['ISO 27001', 'SOC 2'],
                        },
                        {
                            sectionName: 'Delivery & Communication',
                            score: 8.0,
                            validatedSkills: ['ShotGrid Integration', 'Weekly Reports'],
                            unverifiedSkills: ['Client Portal'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Scalability',
                            score: 7.5,
                            validatedSkills: ['100+ Artist Capacity', 'Cloud Burst'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['Multi-site'],
                        },
                        {
                            sectionName: 'Creative Leadership',
                            score: 8.0,
                            validatedSkills: ['Strong Art Direction', 'Look Dev'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Financial Stability',
                            score: 7.5,
                            validatedSkills: ['Stable Operations', 'Insurance'],
                            unverifiedSkills: ['Growth Trajectory'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Environmental & Social',
                            score: 7.8,
                            validatedSkills: ['Diversity Policy', 'Remote Work Options'],
                            unverifiedSkills: ['Carbon Initiatives'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Client Satisfaction',
                            score: 8.5,
                            validatedSkills: ['High Repeat Rate', 'Positive References'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Innovation & R&D',
                            score: 7.5,
                            validatedSkills: ['Internal R&D Projects'],
                            unverifiedSkills: ['AI Research'],
                            nonValidatedSkills: ['Published Research'],
                        },
                    ],
                    pdfReport: { filePath: '', visibility: 'members' },
                },
                {
                    name: 'Zenith Post',
                    country: 'India',
                    size: 'Large',
                    foundedYear: 2012,
                    website: 'https://zenithpost.example.com',
                    demoReel: 'https://vimeo.com/example3',
                    shortDescription: 'Full-service post-production and VFX studio with extensive experience in Bollywood and international co-productions. Competitive pricing with scale.',
                    services: ['CGI', 'Compositing', 'Matchmove', 'Roto & Paint', 'Stereo Conversion', 'DI'],
                    badgeVOE: 'Bronze',
                    globalScore: 6.5,
                    assessment: [
                        {
                            sectionName: 'Pipeline & Technology',
                            score: 6.5,
                            validatedSkills: ['Standard Pipeline', 'Nuke', 'Maya'],
                            unverifiedSkills: ['Houdini FX'],
                            nonValidatedSkills: ['USD Pipeline', 'Custom Tools'],
                        },
                        {
                            sectionName: 'Team & Organization',
                            score: 7.0,
                            validatedSkills: ['Large Team', 'Department Leads'],
                            unverifiedSkills: ['Training Program'],
                            nonValidatedSkills: ['Structured Onboarding'],
                        },
                        {
                            sectionName: 'Quality Assurance',
                            score: 6.0,
                            validatedSkills: ['Internal Review Process'],
                            unverifiedSkills: ['Color Management'],
                            nonValidatedSkills: ['Multi-stage QC'],
                        },
                        {
                            sectionName: 'Security & Compliance',
                            score: 6.0,
                            validatedSkills: ['Basic Security Measures'],
                            unverifiedSkills: ['TPN Application'],
                            nonValidatedSkills: ['ISO 27001', 'GDPR'],
                        },
                        {
                            sectionName: 'Delivery & Communication',
                            score: 6.5,
                            validatedSkills: ['Regular Updates', 'ShotGrid'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['Client Portal'],
                        },
                        {
                            sectionName: 'Scalability',
                            score: 7.5,
                            validatedSkills: ['1000+ Artist Capacity', 'Cost Effective'],
                            unverifiedSkills: ['Cloud Infrastructure'],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Creative Leadership',
                            score: 6.0,
                            validatedSkills: ['Experienced Supervisors'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['Art Direction', 'Look Dev Excellence'],
                        },
                        {
                            sectionName: 'Financial Stability',
                            score: 7.0,
                            validatedSkills: ['Established Business', 'Insurance Coverage'],
                            unverifiedSkills: [],
                            nonValidatedSkills: [],
                        },
                        {
                            sectionName: 'Environmental & Social',
                            score: 6.0,
                            validatedSkills: ['Large Employer'],
                            unverifiedSkills: ['Diversity Initiatives'],
                            nonValidatedSkills: ['Carbon Program', 'Mental Health Support'],
                        },
                        {
                            sectionName: 'Client Satisfaction',
                            score: 6.5,
                            validatedSkills: ['Competitive Pricing'],
                            unverifiedSkills: ['Repeat Client Rate'],
                            nonValidatedSkills: ['International Awards'],
                        },
                        {
                            sectionName: 'Innovation & R&D',
                            score: 5.5,
                            validatedSkills: ['Process Improvement'],
                            unverifiedSkills: [],
                            nonValidatedSkills: ['R&D Department', 'Publications'],
                        },
                    ],
                    pdfReport: { filePath: '', visibility: 'members' },
                },
            ];

            for (const vendorData of sampleVendors) {
                await Vendor.create(vendorData);
            }
            console.log(`🏢 ${sampleVendors.length} sample vendors created`);
        } else {
            console.log(`🏢 ${vendorCount} vendors already exist, skipping`);
        }

        console.log('✅ Seeding complete!');
        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
};

seedData();
