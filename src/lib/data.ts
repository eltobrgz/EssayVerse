import type { User, Essay, CommunityPost } from './definitions';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  avatarUrl: 'https://placehold.co/100x100'
};

export const mockEssays: Essay[] = [
  {
    id: '1',
    title: 'The Role of Technology in Modern Education',
    type: 'ENEM',
    content: 'Technology has revolutionized the educational landscape. The integration of digital tools in classrooms has fostered a more interactive and personalized learning experience. However, it is crucial to address the challenges of digital equity and the potential for distraction...',
    submittedAt: '2024-07-15T10:30:00Z',
    score: 88,
    feedback: 'Excellent argumentative structure and clear thesis. The arguments are well-supported with relevant examples. Consider elaborating on the counter-arguments to provide a more balanced view.',
    suggestions: 'To improve, try to incorporate a more critical analysis of the sources cited. Also, vary your sentence structure to enhance readability and engagement.',
    estimatedGrade: 'A-',
  },
  {
    id: '2',
    title: 'Environmental Conservation Efforts',
    type: 'Fuvest',
    content: 'The urgency of environmental conservation cannot be overstated. From governmental policies to individual actions, a multi-faceted approach is required to mitigate the effects of climate change. This essay explores various strategies and their effectiveness...',
    submittedAt: '2024-07-10T14:00:00Z',
    score: 76,
    feedback: 'Good overview of the topic with solid points. The introduction effectively sets the stage. The conclusion could be stronger by summarizing the key arguments more forcefully.',
    suggestions: 'Strengthen your analysis by providing more specific data and statistics to back up your claims. The section on international policy could be more detailed.',
    estimatedGrade: 'B',
  },
  {
    id: '3',
    title: 'The Impact of Social Media on Society',
    type: 'Custom',
    content: 'Social media has become an integral part of daily life, connecting people across the globe. While it offers unprecedented opportunities for communication and information sharing, it also presents significant challenges, including the spread of misinformation and its impact on mental health...',
    submittedAt: '2024-06-28T09:00:00Z',
    score: 92,
    feedback: 'A very well-written and insightful essay. The analysis is deep and nuanced, covering both positive and negative aspects of social media comprehensively.',
    suggestions: 'The essay is strong, but could benefit from a concluding paragraph that offers a forward-looking perspective or a call to action.',
    estimatedGrade: 'A',
  },
];

export const mockCommunityPosts: CommunityPost[] = [
  {
    id: '1',
    title: 'How do you structure a perfect ENEM essay introduction?',
    content: 'I\'m struggling to write compelling introductions for my ENEM practice essays. Does anyone have a template or a set of tips they follow? Any help would be appreciated!',
    author: {
      name: 'Maria Clara',
      avatarUrl: 'https://placehold.co/100x100'
    },
    createdAt: '2024-07-20T11:45:00Z',
    replyCount: 5,
  },
  {
    id: '2',
    title: 'Model Essay: The Importance of Historical Knowledge (Fuvest)',
    content: 'Hey everyone, I scored well on this essay about historical knowledge for Fuvest and wanted to share it as a potential model. Hope it helps some of you. Feel free to ask questions or give feedback.',
    author: {
      name: 'Pedro Almeida (Teacher)',
      avatarUrl: 'https://placehold.co/100x100'
    },
    createdAt: '2024-07-19T18:20:00Z',
    replyCount: 12,
  },
  {
    id: '3',
    title: 'Resources for improving vocabulary?',
    content: 'I\'ve received feedback that my vocabulary is a bit repetitive. What are the best resources (apps, books, websites) you guys use to expand your vocabulary for academic writing?',
    author: {
      name: 'Lucas Souza',
      avatarUrl: 'https://placehold.co/100x100'
    },
    createdAt: '2024-07-18T15:00:00Z',
    replyCount: 8,
  },
];

export const mockProgressData = {
  overall: [
    { date: 'Jan', score: 65 },
    { date: 'Feb', score: 68 },
    { date: 'Mar', score: 75 },
    { date: 'Apr', score: 72 },
    { date: 'May', score: 80 },
    { date: 'Jun', score: 82 },
    { date: 'Jul', score: 88 },
  ],
  byType: [
    { type: 'ENEM', averageScore: 85 },
    { type: 'Fuvest', averageScore: 78 },
    { type: 'Custom', averageScore: 90 },
  ],
};
