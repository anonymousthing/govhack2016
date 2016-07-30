using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CityCycle.Models;

namespace CityCycle.Interfaces
{
    interface ICityCycleService
    {
        IList<CityCycleStation> GetStations();
    }
}
