using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CsvIngestion.Services;

namespace BikeRackTestApplication
{
    class Program
    {
        static void Main(string[] args)
        {
            var service = new CsvIngestion.Services.BikeRackService();
        }
    }
}
