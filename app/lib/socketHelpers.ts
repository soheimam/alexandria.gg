// /lib/socketHelpers.ts
export const connectToLessonSocket = (lessonId: string) => {
    const socket = new WebSocket("wss://mockserver.com/lesson");
  
    socket.onopen = () => {
      console.log("WebSocket connected");
      socket.send(JSON.stringify({ type: "start-lesson", lessonId }));
    };
  
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "lesson-ready") {
        console.log("Lesson is ready:", data);
        // handle lesson ready logic (redirect or state update)
      }
    };
  
    socket.onerror = (err) => {
      console.error("WebSocket error:", err);
    };
  
    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };
  
    return socket;
  };
  