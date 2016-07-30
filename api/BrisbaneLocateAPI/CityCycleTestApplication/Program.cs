using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CityCycle.Services;

namespace CityCycleTestApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            CityCycleService service = new CityCycleService();
            service.GetStations();
        }
    }
}
