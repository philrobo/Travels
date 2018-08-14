function myTrim(x) {
    return x.replace(/^\s+|\s+$/gm,'');
}

function checkBNandDateinDB(myObj)
{
    $.ajax({
            
        url:"checkBNandDate.php", //the page containing php script to check
        type: "post", //request type,
        dataType: 'text',
        data: JSON.stringify(myObj),
        success: function(response) { 
            if (response.includes("nothing")) {
                $("#selectDriver1").val("0");
                $("#selectDriver2").val("0");
                $("#selectCleaner").val("0");
                $("#inputDate").data("ticketid","0");
                $("#headerId").data('ticketid',"0");
                $('#detailTable > tbody').empty();
            }
            else {
                var res = response.split("~");
                $("#selectDriver1").val(myTrim(res[0]));
                $("#selectDriver2").val(myTrim(res[1]));
                $("#selectCleaner").val(myTrim(res[2]));
                $("#inputDate").data("ticketid",res[3]);
                var ticketid = $("#inputDate").data("ticketid");
                console.log(ticketid);
                $('#detailTable > tbody').empty();
                if (ticketid > 0)
                    var myObj = {};
                    myObj['rowid'] = "0";
                    myObj['ticketid'] = ticketid;
               
                    $.ajax({
                            
                        url:"fetchTicketRevenueDetails.php", //the page containing php script to check
                        type: "post", //request type,
                        dataType: 'text',
                        data: JSON.stringify(myObj),
                        success: function(response) { 
                            console.log(response);
                            if (response.includes("nothing")) {
                            }
                            else {
                                var res = response;
                                //console.log(res);
                                $('#detailTable > tbody:last-child').append(res);
                            }
                        }
                    });
                
            }
        }
    });

    
}

$( document ).ready(function() {

    $( "#selectBN" ).change(function() {
      
        var inputDate = $("#inputDate").val();
        if (inputDate !="") {
            //need to check if there is record for the date and busnumber comibination

            //console.log(inputDate);
            var myObj = {};
            myObj['inputDate'] = $("#inputDate").val();
            myObj['bn'] = $("#selectBN").val();

            checkBNandDateinDB(myObj);

            
        }
       
    });

    $( "#inputDate" ).change(function() {
      
        //input date changed just check if there is a valid bus number selected

        var bn = $("#selectBN").val();
        console.log(bn);
        if (bn != null)
        {
            //need to check if there is record for the date and busnumber comibination
            var myObj = {};
            myObj['inputDate'] = $("#inputDate").val();
            myObj['bn'] = bn;

            checkBNandDateinDB(myObj);

            console.log(bn);
            
        }

    });

   
    $( "#selectDriver1,#selectDriver2,#selectCleaner" ).change(function() {
      
        //input date changed just check if there is a valid bus number selected

        var driver2 = $("#selectDriver2").val();
        var driver1 = $("#selectDriver1").val();
        console.log(driver1);
        if (driver1 != null && driver2 != null)
        {
            //need to check if both driver names are same
            if (driver1 === driver2)
            {
                alert("both driver name can not be the same");
                $(this).val("0");
                return false;
            }
            //if the driver names are different we may need to update the record in the master
            //check if the record is already there in the master by fetching ticketid
            var ticketid =  parseInt($("#inputDate").data('ticketid'));
            if (ticketid > 0 ) {
                //we can update the record using ajax
                var myObj = {};
                myObj['rowid'] = $("#headerId").data('rowid');
                myObj['ticketid'] = ticketid;
                myObj["driver1"] = $("#selectDriver1").val();
                myObj["driver2"] = $("#selectDriver2").val();
                myObj["cleaner"] = $("#selectCleaner").val();
                console.log(ticketid);
                $.ajax({
            
                    url:"insertTicketRevenue.php", //the page containing php script
                    type: "post", //request type,
                    dataType: 'text',
                    data: JSON.stringify(myObj),
                    success: function(response) {console.log(response); }
                });
            }
            
        }

    });


    $( "#link1" ).click(function() {

            var rowid = $( "#link1" ).data("rowid");
            var myBookId =  $( "#link1" ).text();
            var myrow =  $( "#link1" ).parent().parent();
            var ticket = $.trim(myrow.find('td:eq(1)').html());//td:eq(0) means first td of this row
            var rate = $.trim(myrow.find('td:eq(2)').html())
            var commision = $.trim(myrow.find('td:eq(4)').html())

            var total = parseInt(ticket) * parseInt(rate);
            var gt = parseInt(total) + parseInt(commision);
    
            $("#inputBP").val( rowid);
            $("#inputTicket").val( ticket);
            $("#inputRate").val( rate);
            $("#inputCommission").val( commision);

            $("#inputTotal").text( total);
            $("#inputGT").text(gt);

            console.log(rowid);




    });

    $( "#inputRate" ).change(function() {
      
        var ticket = $("#inputTicket").val();
        var rate = $("#inputRate").val();
     
        var total = parseInt(ticket) * parseInt(rate);
        $("#inputTotal").text( total);

    });

    $( "#inputTicket" ).change(function() {
     
        var ticket = $("#inputTicket").val();
        var rate = $("#inputRate").val();
     
        var total = parseInt(ticket) * parseInt(rate);
        $("#inputTotal").text( total);

    });

    $( "#inputCommission" ).change(function() {
     
        var total = $("#inputTotal").text();
        var commission = $("#inputCommission").val();
     
        var gt = parseInt(total) + parseInt(commission);
        $("#inputGT").text( gt);

    });

    $( "#btnDelete" ).click(function() {

        //firt find which row is selected by going through all the rows in the table
        //var rowCount = $('#detailTable >tbody >tr').length;
        var rowid="";
       
        $("input[type=radio]").each(
            function() {

                if ($(this).is(':checked'))
                 
                    if (confirm("Do you really want to delete the selected row?")) {
                        rowid = $(this).val();
                        var myObj = {};
                        myObj['rowid'] = rowid;
                        myObj['ticketid'] = $("#inputDate").data('ticketid');
                        $.ajax({
                           url:"removeTicketDetail.php", //the page containing php script
                           type: "post", //request type,
                           dataType: 'text',
                           data: JSON.stringify(myObj),
                           success: function(response) { 
                               console.log(response);
                               $('#detailTable > tbody').empty();
                               if (response.includes("nothing")) { }
                               else {
                                    $('#detailTable > tbody:last-child').append(response);
                               }
                            }
                         });
                    } else 
                        return;
                    
                
            }   
        );
    });
       

    $( "#btnEdit" ).click(function() {

        //firt find which row is selected by going through all the rows in the table
        //var rowCount = $('#detailTable >tbody >tr').length;
        var rowid="";
       
        $("input[type=radio]").each(
            
                function() {

                   if ($(this).is(':checked'))
                    {
                        rowid = $(this).val();
                        console.log(rowid);
                        var this_row = $(this).closest('tr');
                        $("#inputBP").val(this_row.find('td:eq(0)').text());
                        $("#inputTicket").val(this_row.find('td:eq(1)').text());
                        $("#inputRate").val(this_row.find('td:eq(2)').text());
                        $("#inputTotal").text( this_row.find('td:eq(3)').text());
                        $("#inputCommission").val(this_row.find('td:eq(4)').text());
                        $("#inputGT").text(this_row.find('td:eq(5)').text());
                        //var productId = $.trim(this_row.find('td:eq(0)').html());//td:eq(0) means first td of this row
                        //var product = $.trim(this_row.find('td:eq(1)').html())
                        //var Quantity = $.trim(this_row.find('td:eq(2)').html())
                    }
                }
            
            );
            
        $("#headerId").data("rowid", rowid);
        

    });

    $( "#btnAdd" ).click(function() {

        //if there is no value set for master fields (busnumber, driver etc.. don't start)
        var inputDate = $("#inputDate").val();
        if (inputDate !="") {
            var bn = $("#selectBN").val();
            if (bn != null)
            {
                var driver1 = $("#selectDriver1").val();
                if (driver1 != null)
                {
                    var driver2 = $("#selectDriver2").val();
                    if (driver2 != null)
                    {
                        var cleaner = $("#selectCleaner").val();
                        if (cleaner != null)
                        {
                        }
                        else
                        {
                            alert('Please select Cleaner');
                            return false;  
                        }
                    }
                    else
                    {
                        alert('Please select Driver 2..');
                        return false;  
                    }
                }
                else
                {
                    alert('Please select Driver 1..');
                    return false;  
                }
            }
            else
            {
                alert('Please select BusNumber..');
                return false;  
            }

        }
        else
        {
             alert('Please select Date..');
             return false; 
        }



        $("#headerId").text('Add New Record..');
        $("#headerId").data("rowid", "0");
        $("#inputBP").val('');
        $("#inputTicket").val( '');
        $("#inputRate").val( '');
        $("#inputCommission").val('' );

        $("#inputTotal").text( '');
        $("#inputGT").text('');

    });

    $( "#btnSave" ).click(function() {


        var myObj = {};
        myObj['rowid'] = $("#headerId").data('rowid');
        myObj['ticketid'] = $("#headerId").data('ticketid');
        myObj["BP"] = $("#inputBP").val();
        myObj["rate"]  = $("#inputRate").val();
        myObj["ticket"]  = $("#inputTicket").val();
        myObj["com"]  = $("#inputCommission").val();

        myObj["inputDate"] = $("#inputDate").val();
        myObj["bn"] = $("#selectBN").val();
        myObj["driver1"] = $("#selectDriver1").val();
        myObj["driver2"] = $("#selectDriver2").val();
        myObj["cleaner"] = $("#selectCleaner").val();
                       
        $.ajax({
            
                url:"insertTicketRevenue.php", //the page containing php script
                type: "post", //request type,
                dataType: 'text',
                data: JSON.stringify(myObj),
                success: function(response1) { 
                    var ticketid = response1;
                    console.log('inside ')
                    console.log(ticketid);
                    myObj['ticketid'] = ticketid;
                    $.ajax({
                        url:"insertTicketDetails.php", //the page containing php script to check
                        type: "post", //request type,
                        dataType: 'text',
                        data: JSON.stringify(myObj),
                        success: function(response) { 
                            //console.log(response);
                            if (response.includes("nothing")) {
                            }
                            else {
                                var res = response;
                                $('#detailTable > tbody:last-child').empty();
                                $('#detailTable > tbody:last-child').append(res);
                            }
                        } 
                    });
                }
               
        });

        
        
    });
   
    
});

