using CsvIngestion.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BrisbaneLocateAPI.Controllers
{
    [RoutePrefix("fountain")]
    public class FountainController : ApiController
    {
        public FountainController()
        {
            string path = System.Web.HttpContext.Current.Server.MapPath("Content/drinkingFountains.csv");
            new CsvIngestion.Services.DrinkingFountainService(path);
        }

        [HttpGet]
        public List<DrinkingFountain> Get()
        {
            return CsvIngestion.Services.DrinkingFountainService.Fountains;
        }
    }    
}
