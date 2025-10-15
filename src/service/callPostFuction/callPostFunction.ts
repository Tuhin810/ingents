export const callPostFunction = ({userText, reply, imageUrl,videoUrl,detectPlatform, userId,fbProjectId}:any) => {
  if (imageUrl !== undefined && imageUrl.length > 0) {
    console.log("Image generated successfully...");
    detectPlatform(userText, reply, imageUrl, undefined, userId, fbProjectId);
  }
  else if(
    videoUrl 
  ){
     detectPlatform(userText, reply, undefined, videoUrl, userId);
  }
  else {
    detectPlatform(userText, reply, undefined, undefined, userId, fbProjectId);
  }
};

