/** Demo curriculum + class roster until the New Believers API exists. */

export const NBC_LESSON_COUNT = 12

export const NBC_LESSONS = [
  {
    number: 1,
    title: "Assurance of Salvation",
    description:
      "Understanding the certainty of eternal life through faith in Christ.",
  },
  {
    number: 2,
    title: "The Bible — God's Word",
    description:
      "How Scripture was given, its authority, and how to read it daily.",
  },
  {
    number: 3,
    title: "Prayer",
    description:
      "Communicating with God — adoration, confession, thanksgiving, and supplication.",
  },
  {
    number: 4,
    title: "The Holy Spirit",
    description: "The person and work of the Holy Spirit in a believer's life.",
  },
  {
    number: 5,
    title: "Water Baptism",
    description:
      "The meaning and importance of baptism as a public declaration of faith.",
  },
  {
    number: 6,
    title: "The Lord's Supper",
    description:
      "Understanding communion as a remembrance and proclamation of Christ.",
  },
  {
    number: 7,
    title: "The Church & Fellowship",
    description:
      "Why belonging to a local church body matters for growth and accountability.",
  },
  {
    number: 8,
    title: "Giving & Stewardship",
    description:
      "Biblical principles of tithing, offerings, and managing God's resources.",
  },
  {
    number: 9,
    title: "Witnessing & Evangelism",
    description: "How to share your testimony and the Gospel with confidence.",
  },
  {
    number: 10,
    title: "Spiritual Warfare",
    description: "Standing firm against the enemy.",
  },
  {
    number: 11,
    title: "Discipleship",
    description: "Growing and helping others grow in Christ.",
  },
  {
    number: 12,
    title: "Living the Christian Life",
    description: "Walking daily as a follower of Jesus.",
  },
]

export const NBC_CURRENT_TEACHER_ID = "teacher-jv"

export const NBC_TEACHERS = [
  {
    id: "teacher-jv",
    name: "Joshua Virile Vasquez",
    shortName: "Joshua Virile Vas.",
    role: "Lead Teacher",
    isYou: true,
  },
  {
    id: "teacher-gm",
    name: "Grace Mensah",
    shortName: "Grace Mensah",
    role: "Teacher",
    isYou: false,
  },
]

export const NBC_STUDENTS = [
  {
    id: "s1",
    name: "Maria Santos",
    teacherId: "teacher-jv",
    currentLesson: 4,
    status: "ON_TRACK",
  },
  {
    id: "s2",
    name: "Pedro Cruz",
    teacherId: "teacher-jv",
    currentLesson: 7,
    status: "ON_TRACK",
  },
  {
    id: "s3",
    name: "Ana Reyes",
    teacherId: "teacher-jv",
    currentLesson: 2,
    status: "BEHIND",
  },
  {
    id: "s4",
    name: "James Dela Cruz",
    teacherId: "teacher-jv",
    currentLesson: 9,
    status: "ON_TRACK",
  },
  {
    id: "s5",
    name: "Linda Tan",
    teacherId: "teacher-gm",
    currentLesson: 6,
    status: "ON_TRACK",
  },
  {
    id: "s6",
    name: "Carlos Reyes",
    teacherId: "teacher-gm",
    currentLesson: 3,
    status: "BEHIND",
  },
  {
    id: "s7",
    name: "Sofia Lim",
    teacherId: "teacher-gm",
    currentLesson: 11,
    status: "ADVANCED",
  },
  {
    id: "s8",
    name: "Mark Villanueva",
    teacherId: "teacher-gm",
    currentLesson: 1,
    status: "ON_TRACK",
  },
  {
    id: "s9",
    name: "Hannah Cruz",
    teacherId: "teacher-gm",
    currentLesson: 5,
    status: "ON_TRACK",
  },
  {
    id: "s10",
    name: "Daniel Ong",
    teacherId: "teacher-gm",
    currentLesson: 8,
    status: "ON_TRACK",
  },
  {
    id: "s11",
    name: "Patricia Go",
    teacherId: "teacher-gm",
    currentLesson: 10,
    status: "ON_TRACK",
  },
  {
    id: "s12",
    name: "Ryan Santos",
    teacherId: "teacher-gm",
    currentLesson: 12,
    status: "ADVANCED",
  },
]

function lessonByNumber(number) {
  return NBC_LESSONS.find((lesson) => lesson.number === number) || null
}

function progressPercent(currentLesson) {
  const completed = Math.max(0, Number(currentLesson) - 1)
  return Math.round((completed / NBC_LESSON_COUNT) * 100)
}

function initials(name) {
  return String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("")
}

function enrichStudent(student) {
  const lesson = lessonByNumber(student.currentLesson)
  return {
    ...student,
    initials: initials(student.name),
    lessonTitle: lesson?.title || "—",
    progress: progressPercent(student.currentLesson),
  }
}

export function getNbcOverview(currentTeacherId = NBC_CURRENT_TEACHER_ID) {
  const myStudents = NBC_STUDENTS.filter(
    (student) => student.teacherId === currentTeacherId
  ).map(enrichStudent)

  const needAttention = myStudents.filter(
    (student) => student.status === "BEHIND"
  ).length

  const teachingLessonNumbers = [
    ...new Set(myStudents.map((student) => student.currentLesson)),
  ].sort((a, b) => a - b)

  const teachingLessons = teachingLessonNumbers
    .map(lessonByNumber)
    .filter(Boolean)

  const teachers = NBC_TEACHERS.map((teacher) => {
    const students = NBC_STUDENTS.filter(
      (student) => student.teacherId === teacher.id
    ).map(enrichStudent)
    const activeLessons = new Set(students.map((s) => s.currentLesson)).size

    return {
      ...teacher,
      initials: initials(teacher.shortName || teacher.name),
      students,
      studentCount: students.length,
      activeLessonCount: activeLessons,
    }
  })

  const studentsByLesson = NBC_LESSONS.map((lesson) => {
    const onLesson = NBC_STUDENTS.filter(
      (student) => student.currentLesson === lesson.number
    ).map(enrichStudent)
    return { ...lesson, students: onLesson, studentCount: onLesson.length }
  })

  return {
    stats: {
      totalLessons: NBC_LESSON_COUNT,
      totalStudents: NBC_STUDENTS.length,
      myStudents: myStudents.length,
      needAttention,
    },
    currentTeacher:
      NBC_TEACHERS.find((teacher) => teacher.id === currentTeacherId) ||
      NBC_TEACHERS[0],
    myStudents,
    teachingLessons,
    lessons: studentsByLesson,
    teachers,
  }
}
