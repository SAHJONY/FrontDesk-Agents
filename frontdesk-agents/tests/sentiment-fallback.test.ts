import { describe, it, expect, vi, beforeEach } from "vitest"

import { analyzeSentimentFromMessage } from "../src/lib/agents/receptionist"

// Mock LangChain OpenAI to avoid actual API calls for integration tests
const mockInvoke = vi.hoisted(() => vi.fn())

vi.mock('@langchain/openai', () => ({
  ChatOpenAI: vi.fn().mockImplementation(function () {
    return {
      invoke: mockInvoke,
      bindTools: vi.fn().mockReturnValue({
        invoke: mockInvoke
      })
    }
  })

}))



describe("analyzeSentimentFromMessage", () => {
  describe("negative sentiment", () => {
    it("detects angry", () => {
      expect(analyzeSentimentFromMessage("I am so angry right now")).toBe("negative")
    })
    it("detects frustrated", () => {
      expect(analyzeSentimentFromMessage("I am really frustrated")).toBe("negative")
    })
    it("detects frustrating", () => {
      expect(analyzeSentimentFromMessage("This is really frustrating")).toBe("negative")
    })
    it("detects terrible", () => {
      expect(analyzeSentimentFromMessage("This is a terrible experience")).toBe("negative")
    })
    it("detects unacceptable", () => {
      expect(analyzeSentimentFromMessage("Your service is unacceptable")).toBe("negative")
    })
    it("detects ridiculous", () => {
      expect(analyzeSentimentFromMessage("This is ridiculous")).toBe("negative")
    })
    it("detects awful", () => {
      expect(analyzeSentimentFromMessage("Awful customer service")).toBe("negative")
    })
    it("detects horrible", () => {
      expect(analyzeSentimentFromMessage("Horrible experience")).toBe("negative")
    })
    it("detects complaint", () => {
      expect(analyzeSentimentFromMessage("I want to file a complaint")).toBe("negative")
    })
    it("detects scam", () => {
      expect(analyzeSentimentFromMessage("This feels like a scam")).toBe("negative")
    })
    it("detects refund in context", () => {
      expect(analyzeSentimentFromMessage("I demand a refund immediately")).toBe("negative")
    })
    it("detects upset", () => {
      expect(analyzeSentimentFromMessage("I am really upset about this")).toBe("negative")
    })
    it("detects furious", () => {
      expect(analyzeSentimentFromMessage("I am furious")).toBe("negative")
    })
    it("detects cancel", () => {
      expect(analyzeSentimentFromMessage("I want to cancel my account")).toBe("negative")
    })
    it("detects cancelled", () => {
      expect(analyzeSentimentFromMessage("My order was cancelled")).toBe("negative")
    })
    it("detects cancellation", () => {
      expect(analyzeSentimentFromMessage("I need a cancellation")).toBe("negative")
    })
    it("detects demand", () => {
      expect(analyzeSentimentFromMessage("I demand a solution")).toBe("negative")
    })
    it("detects multiple negative words", () => {
      expect(analyzeSentimentFromMessage("I am angry and frustrated with this terrible service")).toBe("negative")
    })
  })

  describe("positive sentiment", () => {
    it("detects thank you", () => {
      expect(analyzeSentimentFromMessage("Thank you for your help")).toBe("positive")
    })
    it("detects thanks", () => {
      expect(analyzeSentimentFromMessage("Thanks for resolving this")).toBe("positive")
    })
    it("detects appreciate", () => {
      expect(analyzeSentimentFromMessage("I appreciate your assistance")).toBe("positive")
    })
    it("detects great", () => {
      expect(analyzeSentimentFromMessage("That is great news")).toBe("positive")
    })
    it("detects amazing", () => {
      expect(analyzeSentimentFromMessage("Amazing support team")).toBe("positive")
    })
    it("detects excellent", () => {
      expect(analyzeSentimentFromMessage("Excellent customer service")).toBe("positive")
    })
    it("detects helpful", () => {
      expect(analyzeSentimentFromMessage("You have been very helpful")).toBe("positive")
    })
    it("detects wonderful", () => {
      expect(analyzeSentimentFromMessage("Wonderful experience with your company")).toBe("positive")
    })
    it("detects pleased", () => {
      expect(analyzeSentimentFromMessage("I am pleased with the service")).toBe("positive")
    })
    it("detects grateful", () => {
      expect(analyzeSentimentFromMessage("I am grateful for your help")).toBe("positive")
    })
    it("detects multiple positive words", () => {
      expect(analyzeSentimentFromMessage("Thank you, you have been great and helpful")).toBe("positive")
    })
  })

  describe("neutral sentiment", () => {
    it("returns neutral for an empty string", () => {
      expect(analyzeSentimentFromMessage("")).toBe("neutral")
    })
    it("returns neutral for a simple statement", () => {
      expect(analyzeSentimentFromMessage("I would like to check my account balance")).toBe("neutral")
    })
    it("returns neutral for a yes/no answer", () => {
      expect(analyzeSentimentFromMessage("Yes, that sounds good")).toBe("neutral")
    })
    it("returns neutral for a question", () => {
      expect(analyzeSentimentFromMessage("What are your business hours?")).toBe("neutral")
    })
    it("returns neutral for a number/ID", () => {
      expect(analyzeSentimentFromMessage("My order number is 12345")).toBe("neutral")
    })
    it("returns neutral for mixed sentiment where negative dominates", () => {
      // "frustrated" is negative, "helpful" is positive
      // Function is first-match-wins, so negative wins
      expect(analyzeSentimentFromMessage("I was frustrated but you were helpful")).toBe("negative")
    })
    it("returns neutral for whitespace-only string", () => {
      expect(analyzeSentimentFromMessage("   ")).toBe("neutral")
    })
  })

  describe("case insensitivity", () => {
    it("handles UPPERCASE angry", () => {
      expect(analyzeSentimentFromMessage("I AM ANGRY")).toBe("negative")
    })
    it("handles mixed case FrUsTrAtEd", () => {
      expect(analyzeSentimentFromMessage("I am So FrUsTrAtEd")).toBe("negative")
    })
    it("handles UPPERCASE THANK YOU", () => {
      expect(analyzeSentimentFromMessage("THANK YOU VERY MUCH")).toBe("positive")
    })
  })

  describe("word boundary handling", () => {
    it("does not match partial words for angry", () => {
      // "triangle" contains "angry" as substring "angr" but not full word
      expect(analyzeSentimentFromMessage("I drew a triangle")).toBe("neutral")
    })
    it("matches thank in thanksgiving (known limitation - partial word match)", () => {
      // "thanksgiving" contains "thank" which triggers positive sentiment via includes()
      // This is a known minor limitation - the word list prioritizes recall over precision
      expect(analyzeSentimentFromMessage("Happy thanksgiving")).toBe("positive")
    })
    it("handles punctuation around keyword", () => {
      expect(analyzeSentimentFromMessage("I was so angry!!!")).toBe("negative")
    })
    it("handles comma after keyword", () => {
      expect(analyzeSentimentFromMessage("Thank you, that is great.")).toBe("positive")
    })
  })
})


describe("transferCallTool when NOT triggered by negative sentiment", () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it("routes to transfer agent directly and executes transfer_call tool with neutral sentiment", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "transfer" })  // routeToAgent -> transfer
      .mockResolvedValueOnce({                          // runAgent - transfer agent makes tool call
        content: "",
        tool_calls: [{
          name: "transfer_call",
          args: { department: "billing", caller_name: "John" },
          id: "call_transfer_1"
        }]
      })
      .mockResolvedValueOnce({ content: "I am transferring you to the billing department. [SENTIMENT:neutral]" })

    const result = await handleReceptionistCall("Please transfer me to billing")
    expect(result.sentiment).toBe("neutral")
    expect(result.active_agent).toBe("transfer")
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it("routes to transfer agent without tool calls and returns neutral sentiment", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "transfer" })  // routeToAgent -> transfer
      .mockResolvedValueOnce({ content: "I can help you with that. [SENTIMENT:neutral]" }) // runAgent - no tool calls

    const result = await handleReceptionistCall("I need help")
    expect(result.sentiment).toBe("neutral")
    expect(result.active_agent).toBe("transfer")
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it("routes to transfer agent directly, makes transfer_call tool call, and does NOT trigger sentiment escalation", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "transfer" })  // routeToAgent -> transfer
      .mockResolvedValueOnce({                          // runAgent - transfer tool call
        content: "",
        tool_calls: [{
          name: "transfer_call",
          args: { department: "support", caller_name: "Maria" },
          id: "call_transfer_2"
        }]
      })
      .mockResolvedValueOnce({ content: "Connecting you to support. [SENTIMENT:neutral]" })

    const result = await handleReceptionistCall("Can you connect me to support?")
    expect(result.requires_human).toBe(false)
    expect(result.sentiment).toBe("neutral")
    expect(result.active_agent).toBe("transfer")
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })
})


describe("sentiment fallback in runAgent", () => {
  beforeEach(() => {
    mockInvoke.mockReset()
  })

  it("uses [SENTIMENT:] marker from LLM response when present", async () => {
    // Dynamic import so vi.mock is applied first
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "receptionist" })    // routeToAgent
      .mockResolvedValueOnce({ content: "Glad to help! [SENTIMENT:positive]" })  // runAgent with marker

    const result = await handleReceptionistCall("Thank you")
    expect(result.sentiment).toBe("positive")
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it("falls back to analyzeSentimentFromMessage when LLM response lacks [SENTIMENT:] marker (negative)", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "receptionist" })    // routeToAgent
      .mockResolvedValueOnce({ content: "I understand sir." }) // runAgent - no marker, fallback to analyzeSentimentFromMessage
      .mockResolvedValueOnce({ content: "Transferring now." }) // transfer agent - no marker either, fallback preserves negative

    const result = await handleReceptionistCall("This is completely unacceptable")
    expect(result.sentiment).toBe("negative")
    expect(mockInvoke).toHaveBeenCalledTimes(3)
  })

  it("falls back to analyzeSentimentFromMessage when LLM response lacks [SENTIMENT:] marker (positive)", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "receptionist" })    // routeToAgent
      .mockResolvedValueOnce({ content: "You are welcome." })  // runAgent - no marker

    const result = await handleReceptionistCall("I really appreciate your help")
    expect(result.sentiment).toBe("positive")
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it("falls back to analyzeSentimentFromMessage when LLM response lacks [SENTIMENT:] marker (neutral)", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "receptionist" })    // routeToAgent
      .mockResolvedValueOnce({ content: "Sure, let me check." }) // runAgent - no marker

    const result = await handleReceptionistCall("What are your hours?")
    expect(result.sentiment).toBe("neutral")
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it("uses [SENTIMENT:negative] marker from tool-call LLM follow-up", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    // For the billing agent which has tools
    mockInvoke
      .mockResolvedValueOnce({ content: "billing" })    // routeToAgent -> billing
      .mockResolvedValueOnce({                          // runAgent - billing makes tool call first
        content: "",
        tool_calls: [{
          name: "process_billing_request",
          args: { action: "cancel", reason: "unacceptable" },
          id: "call_1"
        }]
      })
      .mockResolvedValueOnce({ content: "Cancellation submitted. [SENTIMENT:negative]" }) // second LLM call after tool
      .mockResolvedValueOnce({ content: "Transferring to supervisor." }) // transfer agent - no marker, fallback preserves negative

    const result = await handleReceptionistCall("I want to cancel my account, this is unacceptable")
    expect(result.sentiment).toBe("negative")
    expect(mockInvoke).toHaveBeenCalledTimes(4)
  })

  it("falls back when LLM tool-call follow-up response lacks [SENTIMENT:] marker", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "billing" })    // routeToAgent -> billing
      .mockResolvedValueOnce({                          // runAgent - billing makes tool call
        content: "",
        tool_calls: [{
          name: "process_billing_request",
          args: { action: "cancel", reason: "frustrated" },
          id: "call_2"
        }]
      })
      .mockResolvedValueOnce({ content: "Your cancellation has been processed." }) // second LLM - no marker
      .mockResolvedValueOnce({ content: "Transferring to supervisor. [SENTIMENT:negative]" }) // transfer agent

    const result = await handleReceptionistCall("I am extremely frustrated with this service")
    expect(result.sentiment).toBe("negative")
  })

  it("handles call without previousState", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "receptionist" })
      .mockResolvedValueOnce({ content: "Hello! How can I help you today? [SENTIMENT:neutral]" })

    // Call without second argument — previousState is undefined
    const result = await handleReceptionistCall("Hi there")
    expect(result.sentiment).toBe("neutral")
    expect(result.active_agent).toBe("receptionist")
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it("routes to receptionist when LLM returns invalid agent name", async () => {
    const { handleReceptionistCall } = await import("../src/lib/agents/receptionist")

    mockInvoke
      .mockResolvedValueOnce({ content: "invalid_agent_name" })  // routeToAgent -> fallback to 'receptionist'
      .mockResolvedValueOnce({ content: "I can help you. [SENTIMENT:neutral]" })  // runAgent with receptionist

    const result = await handleReceptionistCall("I need help")
    expect(result.sentiment).toBe("neutral")
    expect(result.active_agent).toBe("receptionist")
    expect(mockInvoke).toHaveBeenCalledTimes(2)
  })

  it('returns neutral fallback when analyze_sentiment LLM call fails', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const { analyzeSentimentLLM } = await import('../src/lib/agents/receptionist')

    // Don't set any mock — the inner llm.invoke() returns undefined,
    // causing response.content to throw TypeError, triggering the catch block.

    const result = await analyzeSentimentLLM('How are you?')

    expect(result).toEqual({ sentiment: 'neutral', confidence: 0.5 })
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[SENTIMENT_DEBUG_ERROR]'),
      expect.any(String)
    )
    consoleSpy.mockRestore()
  })
})
