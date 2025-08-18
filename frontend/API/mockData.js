// Mock data for testing the event planner application

const mockUsers = [
    {
        id: 1,
        first_name: "John",
        last_name: "Doe",
        email: "john@example.com",
        password: "password123"
    },
    {
        id: 2,
        first_name: "Jane",
        last_name: "Smith",
        email: "jane@example.com",
        password: "password123"
    },
    {
        id: 3,
        first_name: "Mike",
        last_name: "Johnson",
        email: "mike@example.com",
        password: "password123"
    },
    {
        id: 4,
        first_name: "Sarah",
        last_name: "Wilson",
        email: "sarah@example.com",
        password: "password123"
    }
];

const mockEvents = [
    // Events for John (id: 1)
    {
        id: 1,
        userId: 1,
        title: "Team Meeting",
        date: "2025-01-15",
        time: "09:00",
        description: "Weekly team sync meeting"
    },
    {
        id: 2,
        userId: 1,
        title: "Doctor Appointment",
        date: "2025-01-20",
        time: "14:30",
        description: "Annual check-up"
    },
    {
        id: 3,
        userId: 1,
        title: "Birthday Party",
        date: "2025-01-25",
        time: "18:00",
        description: "Tom's birthday celebration"
    },
    {
        id: 4,
        userId: 1,
        title: "Project Deadline",
        date: "2025-01-30",
        time: "23:59",
        description: "Submit final project deliverables"
    },
    
    // Events for Jane (id: 2)
    {
        id: 5,
        userId: 2,
        title: "Yoga Class",
        date: "2025-01-08",
        time: "07:00",
        description: "Morning yoga session"
    },
    {
        id: 6,
        userId: 2,
        title: "Client Presentation",
        date: "2025-01-12",
        time: "10:00",
        description: "Present Q4 results to client"
    },
    {
        id: 7,
        userId: 2,
        title: "Lunch with Mom",
        date: "2025-01-18",
        time: "12:00",
        description: "Catch up over lunch"
    },
    {
        id: 8,
        userId: 2,
        title: "Book Club",
        date: "2025-01-22",
        time: "19:00",
        description: "Discuss this month's book"
    },
    
    // Events for Mike (id: 3)
    {
        id: 9,
        userId: 3,
        title: "Gym Workout",
        date: "2025-01-10",
        time: "06:00",
        description: "Chest and triceps day"
    },
    {
        id: 10,
        userId: 3,
        title: "Car Service",
        date: "2025-01-14",
        time: "11:00",
        description: "Regular car maintenance"
    },
    {
        id: 11,
        userId: 3,
        title: "Weekend Trip",
        date: "2025-01-26",
        time: "08:00",
        description: "Hiking trip to the mountains"
    },
    
    // Events for Sarah (id: 4)
    {
        id: 12,
        userId: 4,
        title: "Piano Lesson",
        date: "2025-01-09",
        time: "16:00",
        description: "Weekly piano practice"
    },
    {
        id: 13,
        userId: 4,
        title: "Job Interview",
        date: "2025-01-16",
        time: "13:00",
        description: "Interview at Tech Corp"
    },
    {
        id: 14,
        userId: 4,
        title: "Concert",
        date: "2025-01-28",
        time: "20:00",
        description: "Classical music concert downtown"
    },
    
    // Some events for current month (adjust dates as needed)
    {
        id: 15,
        userId: 1,
        title: "New Year Resolution Review",
        date: "2025-01-07",
        time: "19:00",
        description: "Check progress on goals"
    },
    {
        id: 16,
        userId: 2,
        title: "Dental Cleaning",
        date: "2025-01-11",
        time: "15:30",
        description: "6-month dental check-up"
    },
    {
        id: 17,
        userId: 3,
        title: "Friend's Wedding",
        date: "2025-01-19",
        time: "17:00",
        description: "Mark and Lisa's wedding ceremony"
    }
];

// Helper functions for mock data operations
function getUserByEmail(email) {
    return mockUsers.find(user => user.email === email);
}

function getUserById(id) {
    return mockUsers.find(user => user.id === id);
}

function getEventsByUserId(userId) {
    return mockEvents.filter(event => event.userId === userId);
}

function addUser(userData) {
    const newUser = {
        id: mockUsers.length + 1,
        ...userData
    };
    mockUsers.push(newUser);
    return newUser;
}

function addEvent(eventData) {
    const newEvent = {
        id: mockEvents.length + 1,
        ...eventData
    };
    mockEvents.push(newEvent);
    return newEvent;
}

// Initialize localStorage with mock data if it doesn't exist
function initializeMockData() {
    if (!localStorage.getItem('mockUsers')) {
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    }
    if (!localStorage.getItem('mockEvents')) {
        localStorage.setItem('mockEvents', JSON.stringify(mockEvents));
    }
}

function getMockUsers() {
    return JSON.parse(localStorage.getItem('mockUsers') || '[]');
}

function getMockEvents() {
    return JSON.parse(localStorage.getItem('mockEvents') || '[]');
}

function saveMockUsers(users) {
    localStorage.setItem('mockUsers', JSON.stringify(users));
}

function saveMockEvents(events) {
    localStorage.setItem('mockEvents', JSON.stringify(events));
}

// Export functions for use in other files
export {
    mockUsers,
    mockEvents,
    getUserByEmail,
    getUserById,
    getEventsByUserId,
    addUser,
    addEvent,
    initializeMockData,
    getMockUsers,
    getMockEvents,
    saveMockUsers,
    saveMockEvents
};