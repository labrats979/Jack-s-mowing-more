import { Project, ProjectCategory, Testimonial, Service } from './types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'project-1',
    title: 'The Botanical Promenade',
    category: ProjectCategory.PLANTING,
    description: 'A complete perennial overhaul including structural evergreen hedges, a custom curved entry walkway, layered lavender drifts, and premium soil building to ensure multi-season color and local bee support.',
    image: '/src/assets/images/garden_beds_1779327341663.png',
    location: 'Milltown, NJ',
    duration: '4 Days',
    keyMaterials: ['English Lavender', 'Japanese Boxwood Hedges', 'Cedar Bark Mulch', 'NJ Bluestone Pavers'],
    keyHighlights: ['Multi-season blooms', 'Bee & pollinator friendly', 'Drought-tolerant native choices']
  },
  {
    id: 'project-2',
    title: 'Westside Slate Fire Oasis',
    category: ProjectCategory.HARDSCAPING,
    description: 'A masterfully constructed natural slate terrace. Features an integrated heavy-timber basalt fire pit, high-walled concrete planters for architectural height, and twilight low-voltage path lighting.',
    image: '/src/assets/images/hardscape_patio_1779327358083.png',
    location: 'Milltown, NJ',
    duration: '2 Weeks',
    keyMaterials: ['Charcoal Slate Flagstone', 'Cast Concrete Retaining Walls', 'Basalt Fire Ring', 'Low-voltage LED brass risers'],
    keyHighlights: ['Seamless indoor-outdoor grade transition', 'Architectural lighting array', 'Integrated conversational fire-pit seating']
  },
  {
    id: 'project-3',
    title: 'Whispering Cascade Zen Pond',
    category: ProjectCategory.AQUEOUS,
    description: 'A quiet, recirculating aquatic ecosystem incorporating multiple stone drop cascades, natural biological filtration, water lilies, and perimeter planting to block wind and introduce tranquility.',
    image: '/src/assets/images/water_feature_1779327375070.png',
    location: 'Milltown, NJ',
    duration: '9 Days',
    keyMaterials: ['River Basalt Boulders', 'EPDM Eco-Liner', 'Japanese Maple Specimen', 'Water Lilies & Marsh Ferns'],
    keyHighlights: ['Acoustically micro-tuned waterfall steps', 'Low-maintenance biofiltration', 'Perennial wetland edge integration']
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    author: 'Eleanor Vance',
    location: 'Milltown Resident',
    rating: 5,
    projectType: 'Hardscape & Fire Pit Terrace',
    content: 'The level of masonry and attention to detail surpassed everything we hoped for. The team aligned the stone joint lines perfectly with our living room windows, making the transition outside feel absolutely natural. Outstanding team.',
    date: 'April 2026'
  },
  {
    id: 'test-2',
    author: 'Dr. Marcus Aris',
    location: 'Milltown Property Owner',
    rating: 5,
    projectType: 'Horticulture & Front Border Walkway',
    content: 'They treated our soil like gold and replaced our dry clay with lush, organic planting beds. The custom boxwood layers and seasonal lavender flowers attract bees and look brilliant in the morning light.',
    date: 'May 2026'
  },
  {
    id: 'test-3',
    author: 'Clara & Thomas Vance',
    location: 'Milltown Homeowners',
    rating: 5,
    projectType: 'Zen Waterfall & Pond Cascade',
    content: 'The custom waterfall they tuned for us brings the perfect calming backdrop to our morning coffee. They handled the excavation, the eco-liners, and the specimen Japanese Maples with pure expertise.',
    date: 'March 2026'
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'service-l-mowing',
    title: 'Lawn Mowing',
    category: 'Property Care',
    description: 'We provide regular lawn mowing for a clean, even yard.',
    priceEstimate: '$20 - $30+',
    features: ['Licensed cut geometry', 'Premium string edging', 'Sidewalk & driveway blow-off'],
    iconName: 'sparkles'
  },
  {
    id: 'service-l-cleanup',
    title: 'Leaf Cleanup',
    category: 'Seasonal Care',
    description: 'We remove leaves to keep your lawn clear and fresh.',
    priceEstimate: '$150+',
    features: ['Full seasonal lawn clearing', 'Garden beds vacuum sweep', 'Gutters & entry blowing'],
    iconName: 'shovel'
  },
  {
    id: 'service-l-landscape',
    title: 'Landscape Design & Installation',
    category: 'Landscape Construction',
    description: 'We design and install custom landscapes to transform your space.',
    priceEstimate: 'Custom Proposal',
    features: ['Professional onsite alignment', 'Hand-picked specimen plants', 'Mycorrhizae root pre-treatment'],
    iconName: 'tree'
  },
  {
    id: 'service-l-hedge',
    title: 'Hedge Trimming',
    category: 'Shrub & Plant Care',
    description: 'We trim hedges for a neat, well-maintained look.',
    priceEstimate: '$80+',
    features: ['Symmetrical line shaping', 'Encourages dense, healthy leafy structures', 'Full clipping collection & cleanup'],
    iconName: 'tree'
  },
  {
    id: 'service-l-mulch',
    title: 'Mulch Installation',
    category: 'Soil & Bed Health',
    description: 'We install mulch to protect and nourish your garden beds.',
    priceEstimate: '$250+',
    features: ['Consistent 2-3 in depth', 'Vibrant visual border contrast', 'Natural weed barrier protection'],
    iconName: 'shovel'
  },
  {
    id: 'service-l-weed',
    title: 'Weed Removal',
    category: 'Garden Maintenance',
    description: 'We clear weeds to keep your garden tidy and healthy.',
    priceEstimate: '$90+',
    features: ['Root-level absolute pulling', 'Pet & child friendly deterrents', 'Ongoing garden bed health monitoring'],
    iconName: 'hammer'
  },
  {
    id: 'service-l-fertilizer',
    title: 'Fertilizer',
    category: 'Lawn Nutrition',
    description: 'We apply fertilizer to promote strong, healthy grass growth.',
    priceEstimate: '$65+',
    features: ['Macro-nutrient seasonal blends', 'Triggers rich deep green pigment', 'Enhances drought & cold tolerance'],
    iconName: 'sun'
  },
  {
    id: 'service-l-restoration',
    title: 'Lawn Restoration',
    category: 'Turf Rejuvenation',
    description: 'We revive damaged lawns, bringing them back to full health and beauty.',
    priceEstimate: '$350+',
    features: ['Core compaction de-relief', 'High-germination hybrid seeds', 'Rapid healthy grass recovery'],
    iconName: 'droplet'
  }
];

