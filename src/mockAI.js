export const enhanceWithAI = async (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const enhancedData = { ...data };
      
      // Enhance Summary
      if (enhancedData.summary && enhancedData.summary.length > 10) {
        let enhancedSummary = "Passionate and results-driven professional with a proven track record of excellence. " + 
          enhancedData.summary
            .replace(/\bI have\b/gi, "Demonstrated success with")
            .replace(/\bI am\b/gi, "A highly motivated individual who is")
            .replace(/\bworked on\b/gi, "spearheaded the development of")
            .replace(/\bgood at\b/gi, "expert in") + 
          " Committed to continuous improvement and driving impactful business outcomes.";
        
        enhancedData.summary = enhancedSummary;
      }
      
      // Enhance Experience
      if (enhancedData.experience && enhancedData.experience.length > 0) {
        enhancedData.experience = enhancedData.experience.map(exp => ({
          ...exp,
          desc: exp.desc
            .replace(/\bDid\b/gi, "Successfully executed")
            .replace(/\bMade\b/gi, "Architected and delivered")
            .replace(/\bHelped\b/gi, "Collaborated cross-functionally to drive")
            .replace(/\bFixed\b/gi, "Resolved complex technical issues, thereby elevating system stability")
            .replace(/\bWorked with\b/gi, "Partnered seamlessly with")
            .replace(/\btried to\b/gi, "strategized to")
        }));
      }

      // Enhance Projects
      if (enhancedData.projects && enhancedData.projects.length > 0) {
        enhancedData.projects = enhancedData.projects.map(proj => ({
          ...proj,
          desc: proj.desc
            .replace(/\bBuilt\b/gi, "Engineered a scalable solution for")
            .replace(/\bCreated\b/gi, "Conceptualized and deployed")
            .replace(/\bUsed\b/gi, "Leveraged advanced technologies including")
        }));
      }
      
      resolve(enhancedData);
    }, 2500); // 2.5 seconds delay to simulate AI parsing and generation
  });
};
