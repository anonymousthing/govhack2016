using CsvIngestion.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BrisbaneLocateAPI.Controllers
{
    [RoutePrefix("bikerack")]
    public class BikeRackController : ApiController
    {
        public BikeRackController()
        {
            string path = System.Web.HttpContext.Current.Server.MapPath("Content/CBD-bike-racks.csv");
            new CsvIngestion.Services.BikeRackService(path);
        }

        [HttpGet]
        public List<BikeRack> Get()
        {
            return CsvIngestion.Services.BikeRackService.BikeRacks;
        }
    }    
}
