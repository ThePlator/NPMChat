import mongoose from "mongoose"
import dotenv from "dotenv"
import Problem from "../models/Problem.js"

// Load env variables
dotenv.config()

export const problems = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    category: "Arrays",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\``,
    hints: [
      "A really brute force way would be to search for all possible pairs of numbers but that would be too slow. Again, it's best to try out brute force solutions for just for completeness. It is from these brute force solutions that you can come up with optimizations.",
      "So, if we fix one of the numbers, say x, we have to scan the entire array to find the next number y which is value - x where value is the input parameter. Can we change our array keeping so that this search becomes faster?",
      "The second train of thought is, without changing the array, can we use additional space somehow? Like maybe a hash map to speed up the search?",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    
}`,
      python: `def twoSum(nums, target):
    """
    :type nums: List[int]
    :type target: int
    :rtype: List[int]
    """
    pass`,
    },
    testCases: [
      {
        input: "nums = [2,7,11,15], target = 9",
        expectedOutput: "[0,1]",
        isHidden: false,
      },
      {
        input: "nums = [3,2,4], target = 6",
        expectedOutput: "[1,2]",
        isHidden: false,
      },
      {
        input: "nums = [3,3], target = 6",
        expectedOutput: "[0,1]",
        isHidden: true,
      },
    ],
    tags: ["Array", "Hash Table", "Facebook", "Amazon", "Apple"],
  },
  {
    title: "Reverse Linked List",
    slug: "reverse-linked-list",
    difficulty: "Easy",
    category: "Linked Lists",
    description: `Given the \`head\` of a singly linked list, reverse the list, and return the reversed list.

**Example 1:**
\`\`\`
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
\`\`\``,
    hints: [
      "We can do this iteratively or recursively.",
      "For iterative: keep track of previous, current, and next nodes.",
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
    
}`,
    },
    testCases: [
      {
        input: "head = [1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
        isHidden: false,
      },
    ],
    tags: ["Linked List", "Recursion", "Google"],
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "Medium",
    category: "Arrays",
    description: `Given an array of \`intervals\` where \`intervals[i] = [starti, endi]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

**Example 1:**
\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
\`\`\``,
    hints: [
      "Sort the intervals by their starting points.",
      "If the current interval overlaps with the previous one, update the end of the previous interval if needed.",
    ],
    starterCode: {
      javascript: `/**
 * @param {number[][]} intervals
 * @return {number[][]}
 */
function merge(intervals) {
    
}`,
    },
    testCases: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        expectedOutput: "[[1,6],[8,10],[15,18]]",
        isHidden: false,
      },
      {
        input: "intervals = [[1,4],[4,5]]",
        expectedOutput: "[[1,5]]",
        isHidden: false,
      },
    ],
    tags: ["Array", "Sorting", "Google", "LinkedIn"],
  },
]

const seedDatabase = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/npmchat"
    await mongoose.connect(mongoUri)
    console.log("Connected to MongoDB")

    // Delete existing
    await Problem.deleteMany({})
    console.log("Cleared existing problems")

    // Insert new
    await Problem.insertMany(problems)
    console.log("Seeded problems successfully!")

    process.exit(0)
  } catch (error) {
    console.error("Error seeding problems:", error)
    process.exit(1)
  }
}

// If run directly via CLI, execute the seeder.
// We use a simple check to see if the script was executed directly
if (process.argv[1] && process.argv[1].endsWith("seedProblems.js")) {
  seedDatabase()
}
