export const ExtraTheCoord = async () => {
  try {
    const response = await fetch("./old-lady.json");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const arr = await response.json();
    let mini = 200;
    let maxi = -1;
    const newArr = arr.map((ele) => {
      // mini = Math.min(mini, ele[0]);
      // maxi = Math.max(maxi, ele[0]);
      return { x: ele[0] + 240, y: ele[1] + 70 };
    });
    // console.log(mini);
    // console.log(maxi);
    return newArr;
  } catch (error) {
    console.error("Error:", error);
  }
};
