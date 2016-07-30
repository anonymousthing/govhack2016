using CityCycle.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace BrisbaneLocateAPI.Controllers
{
    [RoutePrefix("citycycle")]
    public class CityCycleController : ApiController
    {
        [HttpGet]
        public List<CityCycle.Models.CityCycleStation> Get()
        {
            return new CityCycleService().GetStations().ToList();
        }
    }    
}
