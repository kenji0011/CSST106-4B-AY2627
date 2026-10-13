// ============================================================================
// CSST 106 - Laboratory Registry
// Currently compiled: Laboratory Activity 01 (More will be added as instructions arrive)
// ============================================================================

export const LAB_MODULES = [
  {
    id: 'lab-01',
    number: '01',
    chapter: 'CHAPTER 01 // FUNDAMENTALS',
    shortTag: 'EXP 01 // IMAGES',
    title: 'Introduction to Computer Vision',
    description: 'Image representation, BGR channels, pixel manipulation, cropping ROI, resizing, and rotation.',
    status: 'COMPLETE',
    statusColor: 'green',
    category: 'Fundamentals',
    icon: 'ImageIcon'
  }
];

export function getLabById(id) {
  return LAB_MODULES.find(lab => lab.id === id) || LAB_MODULES[0];
}
